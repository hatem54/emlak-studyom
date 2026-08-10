$lines = Get-Content styles.css -Encoding UTF8
$lines[0..($lines.Length - 5)] | Set-Content styles.css -Encoding UTF8
Get-Content temp.css -Encoding UTF8 | Add-Content styles.css -Encoding UTF8
Remove-Item temp.css
