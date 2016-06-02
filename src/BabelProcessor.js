/**
 * @file BabelProcessor 基于babel6的编译插件
 * @author liuxuanzy(liuxuanzy@qq.com)
 */

import AbstractProcessor from 'edp-build/lib/processor/abstract';
import {transform} from 'babel-core';
import {resolve} from 'path';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'fs';

/**
 * 用于处理ES文件后缀
 *
 * @const
 * @type {RegExp}
 */
const res = /\.(es|es6|jsx)$/i;

/**
 * 缓存文件目录
 *
 * @const
 */
const CACHE_FILE_PATH = resolve(process.cwd(), '.edpproj', 'edp-cache');

/**
 * 基于babel6的编译插件
 *
 * @class BabelProcessor
 */
export default class BabelProcessor extends AbstractProcessor {

    /**
     * 构造函数
     *
     * @param {string} options 配置
     */
    constructor(options) {

        if (!existsSync(resolve(process.cwd(), '.edpproj'))) {
            throw new Error('project is not an edp project, run `edp project init` first');
        }

        if (!existsSync(CACHE_FILE_PATH)) {
            mkdirSync(CACHE_FILE_PATH);
        }

        let ignore = resolve(process.cwd(), '.edpproj', '.gitignore');
        let content = readFileSync(ignore, 'utf8');

        if (!/^edp-cache$/m.test(content)) {
            content += '\nedp-cache';
            writeFileSync(ignore, content, 'utf8');
        }

        super(options);
    }

    /**
     * 构建处理
     *
     * @param {FileInfo} file 文件信息对象
     * @param {ProcessContext} processContext 构建环境对象
     * @param {Function} callback 处理完成回调函数
     */
    process(file, processContext, callback) {

        delete processContext.files[file.path];
        file.path = file.path.replace(res, '.js');
        file.outputPath = file.outputPath.replace(res, '.js');
        file.fullPath = file.fullPath.replace(res, '.js');
        file.outputPath = file.outputPath.replace(/\.es/, '.js');
        file.extname = 'js';
        processContext.addFile(file);

        let md5 = file.md5sum(0, 32);
        // 后边其它地方使用的时候，这个MD5可能不一样了
        file.set('md5sum', null);
        let code = file.data;

        let path = resolve(CACHE_FILE_PATH, 'babel_' + file.path.replace(/\/|\\|\./g, '_') + '.cache');

        if (existsSync(path)) {

            let content = readFileSync(path, 'utf8');
            let backup = content.slice(0, 32);

            if (backup === md5) {
                file.setData(content.slice(32));
                callback();
                return;
            }
        }

        let ret = transform(code, this.compileOptions).code;

        file.setData(ret);
        writeFileSync(path, md5 + ret, 'utf8');
        callback();
    }

    /**
     * 默认配置
     *
     * @static
     * @type {Object}
     */
    static DEFAULT_OPTIONS = {
        name: 'BabelProcessor',
        files: ['*.es'],
        compileOptions: {}
    };
}
