import { faker } from "@faker-js/faker";

faker.seed(42);

const users = Array.from({ length: 100 }, () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = faker.person.fullName({ firstName, lastName });
  return {
    name,
    avatar: faker.image.avatarGitHub(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
  };
});

export default users;
