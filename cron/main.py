import os
import webapp2
from google.appengine.api import urlfetch

class HourlyCronPage(webapp2.RequestHandler):
    def get(self):
        urlfetch.set_default_fetch_deadline(60)
        response = urlfetch.fetch(os.environ['HOURLY_JOB_HOST'])

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(response.content)

app = webapp2.WSGIApplication([
        ('/hourly', HourlyCronPage),
], debug=True)