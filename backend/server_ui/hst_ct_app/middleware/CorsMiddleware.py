
class CorsMiddleware():
  def __init__(self, get_response):
    self.get_response = get_response
  
  def __call__(self, request):
    resp = self.get_response(request)
    resp["Access-Control-Allow-Origin"] = "*"
    resp["Access-Control-Allow-Headers"] = "*"
    return resp

