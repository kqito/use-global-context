/* eslint-disable @typescript-eslint/no-var-requires */

const { configure } = require('enzyme');
const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');

configure({ adapter: new Adapter() });
