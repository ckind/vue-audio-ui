publishFolder="../_publish_local"

mkdir -p $publishFolder

# Get file name that will be generated from npm pack
fileName=$(printf '%s-%s.tgz' "$(npm pkg get name | tr -d '"')" "$(npm pkg get version | tr -d '"')")

npm pack --pack-destination $publishFolder

filePath="${publishFolder}/${fileName}"

tar -xzf $filePath -C $publishFolder

echo $filePath