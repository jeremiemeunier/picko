import { version } from "../package.json";
const tag = `staty[${version}] `;

export const composeTime = () => {
  const now = new Date();

  const day =
    now.getDate().toString().length < 2 ? `0${now.getDate()}` : now.getDate();
  const month =
    (now.getMonth() + 1).toString().length < 2
      ? `0${now.getMonth() + 1}`
      : now.getMonth() + 1;
  const year = now.getFullYear();

  const hours =
    now.getHours().toString().length < 2
      ? `0${now.getHours()}`
      : now.getHours();
  const minutes =
    now.getMinutes().toString().length < 2
      ? `0${now.getMinutes()}`
      : now.getMinutes();
  const seconds =
    now.getSeconds().toString().length < 2
      ? `0${now.getSeconds()}`
      : now.getSeconds();
  const miliseconds = () => {
    switch (now.getMilliseconds().toString().length) {
      case 1:
        return `00${now.getMilliseconds()}`;
        break;
      case 2:
        return `0${now.getMilliseconds()}`;
      default:
        return now.getMilliseconds();
    }
  };

  return `[${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${miliseconds()}]`;
};

export const logger = (content) => {
  console.log(`${composeTime()} ${tag}${content}`);
};
