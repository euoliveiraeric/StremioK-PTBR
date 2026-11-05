const path = require('path');
module.exports = name => require(process.env.STREMIOK_TEST_TOOLS ? path.join(process.env.STREMIOK_TEST_TOOLS, name) : name);
