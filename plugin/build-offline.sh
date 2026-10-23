#!/bin/sh
# Compila il plugin senza Maven (contro stub minimi dell'API Bukkit, non inclusi nel jar).
# Con internet basta invece: mvn package
set -e
cd "$(dirname "$0")"
rm -rf build && mkdir -p build/stubs build/classes dist
javac --release 17 -d build/stubs $(find stubs -name '*.java')
javac --release 17 -encoding UTF-8 -cp build/stubs -d build/classes $(find src/main/java -name '*.java')
cp src/main/resources/*.yml build/classes/
jar --create --file dist/TiberiusCollega-1.0.0.jar -C build/classes .
rm -rf build
echo "dist/TiberiusCollega-1.0.0.jar"
