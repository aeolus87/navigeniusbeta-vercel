require('dotenv').config(); // Load .env file

console.log('Environment Variables:', process.env.REACT_APP_API_KEY);

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/firebase/firebase.js', // Adjust according to your entry file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
      'process.env.AUTH_DOMAIN': JSON.stringify(process.env.AUTH_DOMAIN),
      'process.env.DATABASE_URL': JSON.stringify(process.env.DATABASE_URL),
      'process.env.PROJECT_ID': JSON.stringify(process.env.PROJECT_ID),
      'process.env.STORAGE_BUCKET': JSON.stringify(process.env.STORAGE_BUCKET),
      'process.env.MESSAGING_SENDER_ID': JSON.stringify(
        process.env.MESSAGING_SENDER_ID,
      ),
      'process.env.APP_ID': JSON.stringify(process.env.APP_ID),
    }),
  ],
};
