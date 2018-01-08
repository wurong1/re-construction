# re-construction
re-construction
开发模式:(npm run dev)
在需要重构的页面（html, ftl）引入下面的js
根据webpack.config配置开发模式下编译之后只生成了一个js文件
<script src="https://localhost:8888/crm/dist/app.js"></script>


生产模式:(npm run build)
根据webpack.production.config的配置，打包出来会有三个文件
<@css href="dist/app.css"/>
<@js src="
  dist/common.js,
  dist/app.js"/>


入口文件：
if(document.getElementById('app')) {
  render(
    <Root store={store} history={appHistory}/>,
    document.getElementById('app')
  );
}

替换重构页面上的ID为app的dom,因为是重构页面所以不需要用webpack-html-plugin生成一个html


