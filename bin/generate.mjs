// @ts-check
import get from "..";
import { argv } from "node:process";

get({ writeToFile: argv[2] });
