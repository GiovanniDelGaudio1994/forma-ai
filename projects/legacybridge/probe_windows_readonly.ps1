# SPDX-License-Identifier: AGPL-3.0-only
# Copyright (C) 2026 Giovanni Del Gaudio
# LegacyBridge Public Probe — Windows PowerShell 5.1; no writes or network.
# Queries hardware through WMI without requesting user, serial, IP or key.
$ErrorActionPreference = 'Stop'
function SafeWmi($Class) {
  try { Get-WmiObject -Class $Class -ErrorAction Stop }
  catch { $null }
}
$cpu = SafeWmi Win32_Processor | Select-Object -First 1
$pc = SafeWmi Win32_ComputerSystem | Select-Object -First 1
$os = SafeWmi Win32_OperatingSystem | Select-Object -First 1
$disk = @(SafeWmi Win32_DiskDrive | ForEach-Object {
  [ordered]@{ model=$_.Model; declared_bytes=$_.Size; interface=$_.InterfaceType; capacity_verified=$false }
})
$result = [ordered]@{
  project='LegacyBridge'; schema_version=1; read_only=$true
  model=$pc.Model
  cpu=[ordered]@{ name=$cpu.Name; data_width_bits=$cpu.DataWidth; address_width_bits=$cpu.AddressWidth; popcnt='not_measured'; sse42='not_measured' }
  installed_ram_bytes=$pc.TotalPhysicalMemory
  windows=[ordered]@{ name=$os.Caption; version=$os.Version; architecture=$os.OSArchitecture }
  drives=$disk
  windows_11_compatible='not_assessed'
  privacy='No usernames, serial numbers, MAC or Windows product keys included.'
}
$result | ConvertTo-Json -Depth 6
