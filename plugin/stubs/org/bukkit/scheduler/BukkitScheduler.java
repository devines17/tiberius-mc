package org.bukkit.scheduler;
public interface BukkitScheduler { BukkitTask runTask(org.bukkit.plugin.Plugin p, Runnable r); BukkitTask runTaskAsynchronously(org.bukkit.plugin.Plugin p, Runnable r); }
