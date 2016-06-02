# edpx-babel
基于babel6的edp插件。

## Install

``` sh
$ npm i edpx-babel babel-preset-browser --save-dev
```

## Usage

**Webserver(edp-webserver-config.js)**

``` js
var babel = require('edpx-babel/lib/babel-handler');

// 注意babel函数的参数是babel6的配置项目，所有参数都可以在babel官网上查到
// http://babeljs.io/docs/usage/options/
exports.getLocations = function () {
    
    return [
        {
            location: /\.js($|\?)/,
            handler: [
                babel({
                    presets: ['babel-preset-browser']
                })
            ]
        }    
    ];
};

```

**Builder(edp-build-config.js)**

``` js
var BabelProcessor = require('edpx-babel/lib/BabelProcessor');

// 注意babel函数的参数是babel6的配置项目，所有参数都可以在babel官网上查到
// http://babeljs.io/docs/usage/options/
exports.getProcessors = function () {
    
    var babelProcessor = new BabelProcessor({
        files: ['*.es'],
         compileOptions: {
             presets: ['babel-preset-browser']
         }
    });
};

```

## Options
项目使用的配置与babel6完全一致，可以参考[babel6配置手册](http://babeljs.io/docs/usage/options/)。

推荐：

- 如果需要兼容IE6-8之一：可以使用babel-preset-browser预设
- 如果只需要兼容IE9+或者移动：可以使用babel-preset-mobile（TODO）

在ES6的特性选择上，babel-preset-browser会剔除所有依赖ES5的Getter/Setter或者getPrototypeOf函数的功能。其它特性是基本一致的。


