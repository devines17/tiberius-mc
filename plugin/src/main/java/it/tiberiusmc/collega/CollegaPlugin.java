package it.tiberiusmc.collega;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.PluginCommand;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

/**
 * /collega — genera un codice monouso per collegare l'account Minecraft
 * al profilo del forum su tiberiusmc.it.
 *
 * Il plugin chiede il codice al sito con una richiesta firmata HMAC-SHA256
 * (segreto condiviso con la variabile MC_LINK_SECRET su Vercel). Non legge né
 * modifica nient'altro sul server: nessun comando eseguito, nessun dato salvato.
 */
public final class CollegaPlugin extends JavaPlugin implements CommandExecutor {

    private static final Pattern CODE = Pattern.compile("\"code\"\\s*:\\s*\"([A-Z0-9]{6})\"");
    private static final Pattern ERROR = Pattern.compile("\"error\"\\s*:\\s*\"([^\"]{1,200})\"");
    private static final long COOLDOWN_MS = 30_000;

    private final Map<UUID, Long> lastUse = new ConcurrentHashMap<>();
    private HttpClient http;
    private String endpoint;
    private String accountUrl;
    private byte[] secret;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        String site = getConfig().getString("sito", "https://www.tiberiusmc.it").replaceAll("/+$", "");
        String key = getConfig().getString("segreto", "");
        endpoint = site + "/api/mc/link-code";
        accountUrl = site.replaceFirst("^https?://(www\\.)?", "") + "/forum/account";
        if (key == null || key.length() < 32 || key.startsWith("INCOLLA")) {
            getLogger().severe("Imposta 'segreto' in plugins/TiberiusCollega/config.yml (lo stesso valore di MC_LINK_SECRET su Vercel, almeno 32 caratteri). /collega resta disattivato.");
            secret = null;
        } else {
            secret = key.getBytes(StandardCharsets.UTF_8);
        }
        http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
        PluginCommand cmd = getCommand("collega");
        if (cmd != null) cmd.setExecutor(this);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Questo comando va usato in gioco.");
            return true;
        }
        Player player = (Player) sender;
        if (secret == null) {
            sender.sendMessage("§cIl collegamento non è ancora attivo. Avvisa lo staff.");
            return true;
        }
        UUID uuid = player.getUniqueId();
        String name = player.getName();
        long now = System.currentTimeMillis();
        Long last = lastUse.get(uuid);
        if (last != null && now - last < COOLDOWN_MS) {
            sender.sendMessage("§eAspetta qualche secondo prima di chiedere un nuovo codice.");
            return true;
        }
        lastUse.put(uuid, now);
        sender.sendMessage("§7Genero il codice…");

        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            String message = request(uuid, name);
            Bukkit.getScheduler().runTask(this, () -> sender.sendMessage(message));
        });
        return true;
    }

    private String request(UUID uuid, String name) {
        try {
            String body = "{\"uuid\":\"" + uuid + "\",\"name\":\"" + name + "\"}";
            String ts = Long.toString(System.currentTimeMillis() / 1000);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            String sig = HexFormat.of().formatHex(mac.doFinal((ts + "." + body).getBytes(StandardCharsets.UTF_8)));

            HttpRequest req = HttpRequest.newBuilder(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(10))
                    .header("content-type", "application/json")
                    .header("x-tiberius-timestamp", ts)
                    .header("x-tiberius-signature", sig)
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() == 200) {
                Matcher m = CODE.matcher(res.body());
                if (m.find()) {
                    return "§aIl tuo codice: §f§l" + m.group(1) + "§r\n§7Inseriscilo su §f" + accountUrl + "§7 entro 10 minuti. Non darlo a nessuno.";
                }
            }
            Matcher e = ERROR.matcher(res.body());
            getLogger().warning("Codice non generato per " + name + ": HTTP " + res.statusCode() + (e.find() ? " (" + e.group(1) + ")" : ""));
            if (res.statusCode() == 429) return "§eHai chiesto troppi codici: riprova tra qualche minuto.";
            return "§cNon sono riuscito a generare il codice. Riprova più tardi o avvisa lo staff.";
        } catch (Exception ex) {
            getLogger().warning("Sito non raggiungibile: " + ex.getMessage());
            return "§cIl sito non risponde in questo momento. Riprova più tardi.";
        }
    }
}
