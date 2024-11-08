const path = require("path");

const themeEntries = require('./MapStore2/build/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/build/themes.js').extractThemesPlugin;
const ModuleFederationPlugin = require('./MapStore2/build/moduleFederation').plugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = {
    base: __dirname,
    dist: path.join(__dirname, "dist"),
    framework: path.join(__dirname, "MapStore2", "web", "client"),
    code: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
};
module.exports = require('./MapStore2/build/buildConfig')({
    bundles: {
        'MAPSTORE425': path.join(__dirname, "js", "app"),
        'MAPSTORE425-embedded': path.join(__dirname, "js", "embedded"),
        'MAPSTORE425-api': path.join(__dirname, "MapStore2", "web", "client", "product", "api"),
        'geostory-embedded': path.join(__dirname, "js", "geostoryEmbedded"),
        "dashboard-embedded": path.join(__dirname, "js", "dashboardEmbedded")
    },
    themeEntries,
    paths,
    plugins: [extractThemesPlugin, ModuleFederationPlugin],
    prod: true,
    publicPath: undefined,
    cssPrefix: '.MAPSTORE425',
    prodPlugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'indexTemplate.html'),
            chunks: ['MAPSTORE425'],
            publicPath: 'dist/',
            inject: "body",
            hash: true
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'embeddedTemplate.html'),
            chunks: ['MAPSTORE425-embedded'],
            publicPath: 'dist/',
            inject: "body",
            hash: true,
            filename: 'embedded.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'apiTemplate.html'),
            chunks: ['MAPSTORE425-api'],
            publicPath: 'dist/',
            inject: 'body',
            hash: true,
            filename: 'api.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'geostory-embedded-template.html'),
            chunks: ['geostory-embedded'],
            publicPath: 'dist/',
            inject: "body",
            hash: true,
            filename: 'geostory-embedded.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'dashboard-embedded-template.html'),
            chunks: ['dashboard-embedded'],
            publicPath: 'dist/',
            inject: 'body',
            hash: true,
            filename: 'dashboard-embedded.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'wrapperTemplate.html'),
            filename: 'wrapper.html',
            inject: "body",
            hash: true,
            publicPath: 'dist/', // Make sure this is correct for your dev environment
          })          
    ],
    alias: {
        "@mapstore/patcher": path.resolve(__dirname, "node_modules", "@mapstore", "patcher"),
        "@mapstore": path.resolve(__dirname, "MapStore2", "web", "client"),
        "@js": path.resolve(__dirname, "js")
    }
});
