const axios = require("axios");
const _ = require("lodash");

async function parse(inputArray) {
  let data;

  try {
    const response = await axios.get(
      "https://api.fliplet.com/v1/widgets/assets"
    );
    data = response.data;
  } catch (error) {
    console.error(`HTTP error! status: ${error}`);
  }

  let assets = [];
  let processedPackages = new Set(); // Keep track of the packages we've already processed

  // Iterating in the order of the input array
  for (let item of inputArray) {
    if (processedPackages.has(item)) {
      continue;
    }

    let packageData = data.assets[item];
    if (packageData) {
      let packageAssets = _.get(
        packageData,
        ["versions", packageData.latestVersion],
        []
      );

      if (_.isEmpty(packageAssets)) {
        // If the package has no assets of its own, look into its dependencies
        const dependencies = _.get(packageData, "dependencies", []);

        // Reorder dependencies to prioritize ones not in the input array
        const orderedDependencies = _.concat(
          _.difference(dependencies, inputArray),
          _.intersection(dependencies, inputArray)
        );

        const dependencyAssets = _.flatMap(orderedDependencies, (dep) => {
          if (processedPackages.has(dep)) {
            return [];
          }
          processedPackages.add(dep);
          return _.get(
            data,
            ["assets", dep, "versions", data.assets[dep].latestVersion],
            []
          );
        });

        assets = _.concat(assets, dependencyAssets);
      } else {
        // If the package has assets, add them
        assets = _.concat(assets, packageAssets);
      }

      if (item === "moment" && packageAssets.includes("moment.min.js")) {
        _.remove(assets, (asset) => asset === "moment-init.js");
      }
    }
    processedPackages.add(item);
  }

  return assets;
}

parse(["bootstrap", "fliplet-core", "moment", "jquery"])
  .then((assets) => {
    console.log("The list is", assets);
  })
  .catch((error) => console.log(error));
