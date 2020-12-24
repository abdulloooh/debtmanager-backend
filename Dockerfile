FROM node:12

# working directory
WORKDIR /usr/src/app

# NPM already preinstalled with node image
# so copy package.json and packagelock.json next
COPY package*.json ./

# install packages with NPM
# RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# BUNDLE app codes
COPY . .

# expose port
EXPOSE 8080
EXPOSE 27017

# command to run
CMD npm run dev

# ref: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/