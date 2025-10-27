# Final Fix - Database Error

## The Problem:
Console shows: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

## The Solution:
Code now deletes existing quote first, then inserts new one. This avoids the upsert conflict.

## What I Did:
1. Changed `upsert` to delete + insert
2. Created fix-quotes-table.sql (optional - run if you want the unique constraint)

## Test Now:
1. Restart your app
2. Tap the quote card
3. Should work now!

The quotes will be stored properly without the conflict error.
