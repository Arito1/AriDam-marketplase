# Hipsage Marketplace — Defense Notes

## 1. How does authentication work?
When a user registers, the password is hashed using Node.js `crypto.scrypt`. The password is never stored in plain text.  
After successful login or registration, the backend creates a signed token. The frontend stores it in localStorage and sends it in the `Authorization` header.

## 2. How is data stored?
The project uses JSON files as a simple database:
- `users.json`
- `products.json`
- `purchases.json`

The server reads from these files and writes updated data back to them.

## 3. How does product purchase work?
When the user clicks **Buy**:
1. the backend checks if the user is authenticated,
2. checks whether the product exists,
3. checks whether `quantity > 0`,
4. decreases product quantity by 1,
5. creates a purchase record in `purchases.json`.

## 4. How are ratings calculated?
Each product has a `comments` array.  
Every comment contains:
- username
- rating
- text
- createdAt

The backend calculates average rating using all ratings in this array.

## 5. How is ownership checked?
Each product stores:
- `sellerId`
- `sellerUsername`

When editing or deleting a product, the backend compares the current authenticated user's id with `sellerId`.  
If they do not match, the action is rejected.

## 6. Why use validation?
Validation prevents invalid data:
- empty product name
- negative price
- invalid quantity
- invalid rating
- short passwords

This makes the system safer and more stable.

## 7. What errors are handled?
The backend handles:
- invalid JSON
- unauthorized access
- not found routes
- product not found
- duplicate usernames
- out of stock purchase
- internal server errors

## 8. What can the teacher ask you to fix?
Common possible tasks:
- add search or filter,
- prevent user from rating without comment,
- improve UI,
- add confirmation before delete,
- sort products by date or rating.

## 9. Short presentation text
My project is called **Hipsage Marketplace**.  
It is a marketplace web application built with **Next.js** on the frontend and **pure Node.js** on the backend.  
The database is implemented using **JSON files**, as required.  
Users can register and log in, create and manage their own products, buy products, leave ratings and comments, and view purchase history.  
I also implemented validation, password hashing, ownership checks, and error handling.
