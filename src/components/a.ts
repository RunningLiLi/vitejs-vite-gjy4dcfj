import {c} from './c';
import { parse } from "@babel/parser";
import swc2Babel from "swc-to-babel";
import { walk } from "estree-walker";
import { ancestor, full, recursive } from "acorn-walk";

const aaa="aaa1";
const aa=aaa;
class AClass{}
console.log("a",parse,swc2Babel,walk,ancestor,full,recursive);
function a() {
    const b="bbb1"
    console.log(aa,b,AClass,c);
}
function b() {
    console.log("bbb");
}
export {a,b}
// export const a=aa;
