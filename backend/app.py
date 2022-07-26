from flask import Flask,request
import golden_record_extraction
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/v1/golden_record", methods=["POST"])
def extractGoldenRecord():
    file = request.files
    #num_files = request.form
    file_list = file.getlist('file')
    if len(file_list) == 2 :
        print(file_list[0])    
        output = golden_record_extraction.gc(file_list[0].read(), file_list[1].read())
    
    elif len(file_list) == 1:
        data_set = file_list[0].read()
        output = golden_record_extraction.gc_one_file(data_set)
        
    else:
        return "Provide proper files"
    
    return output
    
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8080,debug=True)
