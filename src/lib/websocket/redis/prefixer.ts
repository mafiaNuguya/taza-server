const prefixer = {
  user: (name: string) => `#user:${name}`,
  game: (gameId: string) => `#game:${gameId}`,
  direct: (id: string) => `#direct:${id}`,
};

export default prefixer;
