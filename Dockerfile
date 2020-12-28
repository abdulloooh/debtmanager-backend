FROM node:12

# working directory
WORKDIR /usr/src/app

# NPM already preinstalled with node image
# so copy package.json and packagelock.json next
# COPY package*.json ./

# install packages with NPM
# RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# BUNDLE app codes
# COPY . .   

# expose port
EXPOSE 4000

# command to run
CMD npm run dev

# refs:
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# https://medium.com/zenofai/how-to-build-a-node-js-and-mongodb-application-with-docker-containers-15e535baabf5