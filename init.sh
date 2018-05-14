docker run -d \
       --name=pokeman-mysql \
       -p 3306:3306 \
       -e MYSQL_ROOT_PASSWORD=root \
       -e MYSQL_DATABASE=snitch mysql:5.7
