package org.bukkit.plugin.java;
public abstract class JavaPlugin extends org.bukkit.plugin.PluginBase { public void onEnable() {} public void saveDefaultConfig() {} public org.bukkit.configuration.file.FileConfiguration getConfig() { return null; } public java.util.logging.Logger getLogger() { return null; } public org.bukkit.command.PluginCommand getCommand(String n) { return null; } }
