const _ = require("lodash");

const sampleData = {
  apps: [
    { id: 1, title: "Lorem", published: true, userId: 123 },
    { id: 2, title: "Ipsum", published: false, userId: 123 },
    { id: 3, title: "Dolor", published: true, userId: 456 },
    { id: 4, title: "Sit", published: true, userId: 789 },
    { id: 5, title: "Amet", published: false, userId: 123 },
    { id: 6, title: "Et", published: true, userId: 123 },
  ],
  organizations: [
    { id: 1, name: "Google", suspended: true, userId: 123 },
    { id: 2, name: "Apple", suspended: false, userId: 456 },
    { id: 3, name: "Fliplet", suspended: false, userId: 123 },
  ],
};

class User {
  constructor(config) {
    this.id = config.id;
    this.tableName = "";
    this.attrs = [];
    this.conditions = {};
    this.sort = [];
  }

  select(tableName) {
    this.tableName = tableName;
    return this;
  }

  attributes(attrs) {
    this.attrs = attrs;
    return this;
  }

  where(conditions) {
    this.conditions = conditions;
    return this;
  }

  order(sort) {
    this.sort = sort;
    return this;
  }

  findAll() {
    return new Promise((resolve) => {
      let results = _.filter(sampleData[this.tableName], {
        userId: this.id,
        ...this.conditions,
      });
      results = _.map(results, (item) => _.pick(item, this.attrs));
      if (this.sort.length > 0) {
        results = _.orderBy(results, this.sort);
      }
      resolve(results);
    });
  }

  findOne() {
    return new Promise((resolve) => {
      let result = _.find(sampleData[this.tableName], {
        userId: this.id,
        ...this.conditions,
      });
      if (result) {
        result = _.pick(result, this.attrs);
      }
      resolve(result);
    });
  }
}

// Testing Code

let user = new User({ id: 123 });

user
  .select("apps")
  .attributes(["id", "title"])
  .where({ published: true })
  .order(["title"])
  .findAll()
  .then((apps) => {
    console.log(apps);
  });

user
  .select("organizations")
  .attributes(["id", "name"])
  .where({ suspended: false })
  .findOne()
  .then((organization) => {
    console.log(organization);
  });
