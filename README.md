# 起動する
```
docker-compose -f docker-compose.[dev/prod].yml up
```

# デプロイする
```
heroku container:push web
heroku container:release web
```