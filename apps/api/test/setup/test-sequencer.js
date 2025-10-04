const Sequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    return tests.sort((testA, testB) => {
      const aOrder = this.getTestOrder(testA.path);
      const bOrder = this.getTestOrder(testB.path);
      return aOrder - bOrder;
    });
  }

  getTestOrder(testPath) {
    if (testPath.includes(".get.spec.ts")) return 1;
    if (testPath.includes(".post.spec.ts")) return 2;
    if (testPath.includes(".put.spec.ts")) return 3;
    if (testPath.includes(".delete.spec.ts")) return 4;
    return 5;
  }
}

module.exports = CustomSequencer;
