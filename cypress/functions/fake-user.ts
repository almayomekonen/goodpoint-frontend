import { faker } from '@faker-js/faker'
//for now we set a constant password and school id 
export function fakeUser() {
    return {
        username: faker.internet.email(),
        password: "Password1!",
        schoolId: 1,
    }
}
