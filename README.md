# Exercise Tracker

This is the boilerplate for the [Exercise Tracker project at freecodecamp.org](https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker).

# Steps to run the code
1. First copy file `sample.env` and rename it into `.env`. Fill the `PORT=` with intended port where the api will listen to, for example `PORT=8080`. And fill the `MONGO_URI=` with MongoDB connection string.
2. Open terminal, and navigate to the directory where this code is located, and run `npm install`.
3. After finished installing dependencies, run `npm start`.
4. To test the api, you can use web browser. Access the form to make a `POST` request when creating new user and when creating new exercise. To create `GET` requests, enter the appropriate URL at the browser's adrress bar.
5. To stop the api, type `Ctrl+C` in the terminal.

## API Description
The description of this Exercise Tracker Project:
1. When creating new user via form, a `POST` request will be made at `/api/users` with url encoded data in the request body, for example : `username=user3`, the response is :
```Javascript
{
    "username":"user3",
    "_id":"63afe5d461e65bd4b4c61426"
}
```
2. If there is a `GET` request at `/api/users`, the API will return an array of users. for example :
```Javascript
[
    {
        "username":"user1",
        "_id":"63adaf324732997d2d670498"
    },
    {
        "username":"user2",
        "_id":"63adc5c741cc847f6774e450"
    },
    {
        "username":"user3",
        "_id":"63afe5d461e65bd4b4c61426"
    }
]
```
3. When creating new exercise via form, the _id field, description field, and duration field must be filled, and the date field is optional, if the date is omitted, the current date will be used, if the form is submitted, a `POST` request will be made at `/api/users/63afe5d461e65bd4b4c61426/exercises`, which `63afe5d461e65bd4b4c61426` is the user id, for example if the date is omitted, the response is :
```Javascript
{
    "username":"user3",
    "description":"running",
    "duration":15,
    "date":"Sat Dec 31 2022",
    "_id":"63afe5d461e65bd4b4c61426"
}
```
4.  If there is a `GET` request at `/api/users/:_id/logs`, which `:_id` is the user id, for example : `/api/users/63afe5d461e65bd4b4c61426/logs`, the API will return the user object with a log array of all the exercises added, and an attribute named `count` which containes the total number of exercises belonging to the user, for example:
```Javascript
{
    "username":"user3",
    "count":3,
    "_id":"63afe5d461e65bd4b4c61426",
    "log": [
        {
            "description":"running",
            "duration":15,
            "date":"Sat Dec 31 2022"
        },
        {
            "description":"lifting",
            "duration":10,
            "date":"Thu Dec 01 2022"
        },
        {
            "description":"treadmill",
            "duration":30,
            "date":"Tue Nov 15 2022"
        }
    ]
}
```
5. The `GET` request at `/api/users/:_id/logs` can be added with optional query parameters, which is `GET /api/users/:_id/logs?[from][&to][&limit]`, the parameters in `[]` are optional, which means the API will return the exercises that is greater than or equal than `from` date, and is smaller than or equal than `to` date, and the number of exercises returned will not be greater than `limit`. For example, if the request is `/api/users/63afe5d461e65bd4b4c61426/logs?from=2022-11-16&to=2022-12-31&limit=1`
```Javascript
{
    "username":"user3",
    "count":1,
    "_id":"63afe5d461e65bd4b4c61426",
    "log":[
        {
            "description":"lifting",
            "duration":10,
            "date":"Thu Dec 01 2022"
        }
    ]
}
```