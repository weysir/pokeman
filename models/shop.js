
const TYPE_HP = 0;
const TYPE_MP = 1;
const TYPE_BALL = 2;

const items = [
  {
    type: TYPE_HP,
    name: '草药',
    desc: '补充少量血量',
    price: 10,
    buff: 10,
  },
  {
    type: TYPE_HP,
    name: '高级草药',
    desc: '补充血量',
    price: 50,
    buff: 60,
  },
  {
    type: TYPE_HP,
    name: '辣条',
    desc: '补充大量血量',
    price: 100,
    buff: 150,
  },
  {
    type: TYPE_MP,
    name: 'PP 回复剂',
    desc: '回复少量技能点',
    price: 10,
    buff: 5,
  },
  {
    type: TYPE_MP,
    name: '维他柠檬',
    desc: '回复大量技能点',
    price: 30,
    buff: 15,
  },
  {
    type: TYPE_BALL,
    name: '普通精灵球',
    desc: '捕捉精灵必备道具',
    price: 20,
    buff: 20, // 基础概率
  },
  {
    type: TYPE_BALL,
    name: '高级精灵球',
    desc: '更容易地捕捉精灵',
    price: 60,
    buff: 40, // 基础概率
  }
];

const getItems = () => {
  return items;
}

module.exports = {
  getItems,
}
