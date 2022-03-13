const prefixer = {
  user: (name: string) => `#user:${name}`,
  channel: (channel: string) => `#channel:${channel}`,
  direct: (id: string) => `#direct:${id}`,
};

export default prefixer;
