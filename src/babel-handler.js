/**
 * @file babel babel6编译插件
 * @author liuxuanzy(liuxuanzy@qq.com)
 */

import {transform} from 'babel-core';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'fs';
import {resolve} from 'path';
import {createHash} from 'crypto';


export default function babel(config) {

    let inited = false;

    return function (context) {

        let pathname = context.request.pathname;
        let dirPath = context.conf.documentRoot;
        let cache = resolve(dirPath, '.edpproj', 'edp-cache');

        if (!inited) {

            if (!existsSync(resolve(dirPath, '.edpproj'))) {
                throw new Error('project is not an edp project, run `edp project init` first');
            }

            if (!existsSync(cache)) {
                mkdirSync(cache);
            }

            let ignore = resolve(dirPath, '.edpproj', '.gitignore');
            let content = readFileSync(ignore, 'utf8');

            if (!/^edp-cache$/m.test(content)) {
                content += '\nedp-cache';
                writeFileSync(ignore, content, 'utf8');
            }

            inited = true;
        }

        let code = readFileSync(dirPath + pathname, 'utf8');

        let hash = createHash('md5');
        hash.update(code);
        let md5 = hash.digest('hex');

        let path = resolve(cache, 'babel_' + pathname.replace(/\/|\\|\./g, '_') + '.cache');

        if (existsSync(path)) {

            let content = readFileSync(path, 'utf8');
            let backup = content.slice(0, 32);

            if (backup === md5) {
                context.content = content.slice(32);
                return;
            }
        }

        let ret = transform(code, config).code;
        context.content = ret;
        writeFileSync(path, md5 + ret, 'utf8');
    }
}
