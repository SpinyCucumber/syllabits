# Encoding Document Changes ##

## Approach 1: Direct Mongo-DB Update Objects ##
Example
```
update: {
    "$set": {
        "title": "New Poem Title",
        "lines.$[line0].key": ["i", "i", "t", "t", "s"],
        "lines.$[line1].text": "Poopidy-scoop, scoop-dee-whoop"
    },
    "$push": {
        "lines": {
            "$each": [
                {"order": 15, "text": "New line text", "key": ["i", "p"]}
            ]
        }
        "categories": {
            "$each": ["exquisite", "dusty"]
        }
    },    
}
arrayFilters: {
    line0._id: ObjectId("as129qwOIN8D"),
    line1._id: ObjectId("p10mfiWEROIM")
}
```
### Pros ###
- Built-in solution to "array of objects" problem
- Logic already there, very little work to implement
- Looks (relatively) nice
### Cons ###
- Bypasses Mongoengine, so... **No validation!**
- Lack of validation can introduce security risks (and make more difficult to debug)
- Updates are at the "database-level." This means we can't apply changes at the "application-level" (to create a temporary view of a document, for example.) In other words, all changes have to committed to DB.

## Approach 2: Mongoengine/"Django-style" Update ##
```
update: {
    "set__title": "New Poem Title",
    "set__lines__0__text": "From whence we came we shall return"
    "push__lines": {"order": 15, "text": "New line text", "key": ["i", "p"]}
    "pull__categories": "dusty"
}
```
### Pros ###
- Integrated with Mongoengine, so we have validation
- Logic already there, just have to plug into Mongoengine
### Cons ###
- No solution to "array of objects" problem. (The only workaround splits the update operation into several separate operations, which is horrible for speed.)
- Once again, updates at "database-level." We cannot apply changes to actual Python objects.
- Doesn't map super cleanly to JS

## Approach 3: Custom Solution ##
### Goals ###
1. Map cleanly to Python objects, so we can apply changes at application-level.
2. Provide solution to "array of objects" problem
3. Map cleanly to JS, for convenient change tracking
4. Validation
5. JSON-Based