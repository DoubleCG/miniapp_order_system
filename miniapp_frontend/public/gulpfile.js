let gulp = require('gulp');
let less = require('gulp-less');
let minjs = require('gulp-uglify');
let ejs = require('gulp-ejs');

gulp.task('less',function(){
    gulp.src('less/*.less')
        .pipe(less())
        .pipe(gulp.dest('css'));
});

gulp.task('less-watch',function(){
    gulp.watch('less/*.less',['less']);

});


gulp.task('ejs',function(){
	gulp.src('ejs/main.ejs')
	.pipe(ejs({},{},{ ext: '.html' }))
	.pipe(gulp.dest('page'));
});

gulp.task('ejs-watch',function(){
	gulp.watch('ejs/main*.ejs',['ejs']);
})



gulp.task('watch',['ejs-watch','less-watch'],function(){

})