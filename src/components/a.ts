const aaa=1;
const aa=aaa;
export function a() {
  console.log(aa);
}

const ccc=1;// 比如我改了这一行，通过git提交了；下面导出的c函数就是对应的单位影响源
const cc=ccc;
export function c() {
  console.log(cc);
}



export { b } from './b';
// export { foo as default };
// import { c } from './c';
// import { b } from './b';
// let love = 'wwww';
// let hello = c.toString() + love;
// let hi = hello + 1;
// function foo() {
//   console.log(hello);
// }
