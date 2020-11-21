let project_folder = "dist";
let source = "src";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    img: project_folder + "/img/",
    js: project_folder + "/js/",
  },
  src: {
    html: [source + "/*.html", "!" + source + "/_*.html"],
    css: source + "/scss/styles.scss",
    img: source + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    js: source + "/js/script.js",
  },
  watch: {
    html: source + "/**/*.html",
    css: source + "/scss/**/*.scss",
    img: source + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    js: source + "/js/**/*.js",
  },
  clean: "./" + project_folder + "/",
};

const { stream } = require("browser-sync");
let { src, dest } = require("gulp"),
  gulp = require("gulp");
const fileinclude = require("gulp-file-include");
const browsersync = require("browser-sync");
const del = require("del");
const scss = require("gulp-sass");
const autoPrefixer = require("gulp-autoprefixer");
const group_media = require("gulp-group-css-media-queries");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const babel = require("gulp-babel");
const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')
const webphtml = require('gulp-webp-html')
const webpcss = require('gulp-webpcss')
function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/",
    },
    port: 3000,
    notify: false,
  });
}

const watchFiles = (params) => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
};

const clean = (params) => {
  return del(path.clean);
};

const html = (params) => {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
};
const css = (params) => {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded",
      })
    )
    .pipe(group_media())
    .pipe(
      autoPrefixer({
        cascade: true,
        overrideBrowserlist: ["last 5 versions"],
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
};

const js = (params) => {
  return src(path.src.js)
    .pipe(
      babel({
        plugins: ["@babel/transform-runtime"],
        presets: ["@babel/env"],
      })
    )
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(fileinclude())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
};
const images = (params) => {
  return src(path.src.img)
    .pipe(webp({
        quality:70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: false }],
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
};
let build = gulp.series(clean, gulp.parallel(html, css, js,images));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.images = images;
exports.css = css;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;
