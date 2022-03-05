const prefixer = {
  user: (name: string) => `#user:${name}`,
  channel: (channel: string) => `#channel:${channel}`,
};

export default prefixer;
