/*
 * Copyright 2016 prussian <genunrest@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var spawn = require('child_process').spawn,
    sh = require('shelljs'),
    glob = require('glob')

module.exports = (opts, config, next) => {

    var err = '',
        out = ''
    if (!sh.which('pandoc')) return next('Pandoc Not installed')
    if (opts.args[1]) config.type = opts.args[1]
    // add filters
    config.filters.forEach((filter) => {
        config.buildOpts.push('--filter')
        config.buildOpts.push(filter)
    })
    // add sourcefiles
    config.source_files.forEach((source) => {
        config.buildOpts.push(glob.sync(source))
    })
    // add output
    config.buildOpts.push('-o')
    config.buildOpts.push(`${config.name}.${config.type}`)

    // spawn pandoc with args
    var cmd = spawn('pandoc', config.buildOpts)
    // may enable this, sigint will terminate if it's taking too long
//    var timeout = setTimeout(() => {
//        err = 'Pandoc timed out building your project'
//        cmd.kill()
//    }, 1000 * 60) 

    cmd.stdout.on('data', (data) => {
        out += data
    })

    cmd.stderr.on('data', (data) => {
        err += data
    })

    cmd.on('close', (code) => {
        // clearTimeout(timeout)
        if (code > 0) err += ` - nonzero exit code (${code})`
        else err = null
        return next(err, out, null)
    })
}
