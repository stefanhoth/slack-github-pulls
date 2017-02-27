!#/bin/bash

zip -FSr github-pulls.zip . -x *.git* *bin/\* *.zip *.sh
aws lambda update-function-code --function-name arn:aws:lambda:eu-west-1:953109185106:function:slack-slash-github-pulls --zip-file fileb://./github-pulls.zip --publish
echo "Lambda uploaded and deployed."
