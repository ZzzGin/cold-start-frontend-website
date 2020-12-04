import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm'

const InfoPage = () => {

    const mdText = `
# FaaS Cold Start Benchmark
## Description
Welcome to this helloworld-styled website. This website provides tools to benchmark FaaS solutions from mainstream providers, e.g., AWS, Google, Azure and more. Here is a list of records now in the database. More entries are planned and will come in the future. More details can be found in [backend CDK Github repo](https://github.com/ZzzGin/cold-start-severless-backend-cdk). For any questions or suggestions, please contact zzzgin@hotmail.com.

| Providers | Runtime | Memory Size |
| :- | :- | :- |
| AWS | .NET Core 3.1 | 128, 512, 1024, 2048 |
| AWS | Go 1.x | 128, 512, 1024, 2048 |
| AWS | Java 11 (Corretto) | 128, 512, 1024, 2048 |
| AWS | Node.js 12.x | 128, 512, 1024, 2048 |
| AWS | Ruby 2.7 | 128, 512, 1024, 2048 |
| AWS | Python 3.8 | 128, 512, 1024, 2048 |

## Tool - Benchmark
This tool provides you a view to compare the time break down of different selections (proiders/runtimes/MemSize). The labels of charts will be different for different providers. 

Unit: **milli-second**

You can also toggle **"cold start/warmed call"** to show different data.

**Hover** your cursor on the data point will show details.

### AWS Lambda
*Note 1: Go 1.x is not supported for break down for now.*

REF: [AWS Doc](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-tracing.html)
* Total: This is the **total** time of the life cycle of your Lambda. It's the parent of all subsegments.
* Function: This is the parent of invocation and overhead. You will **pay** for this time period.
* Initialization: You will not pay for this time period. Represents time spent loading your function and running initialization code. This subsegment only appears for the first event processed by each instance of your function.
* Invocation: This period is the actually time for **running your Lambda handler**.
* Overhead: Represents the work done by the Lambda runtime to prepare to handle the next event.

## Tool - History
This tool provides you a view of the history records chart for one selection. 

**Prefix "C"** means this is for cold start calls. **Prefix "W"** means this is for warmed calls.

**Hover** your cursor on the data point will show details.

Click on the lables to toggle **hiding/showing** lines.

## Tested functions
All tested functions do the same job, and are default functions provided by AWS Lambda. They get triggered by caller and then simply return http status code 200 and a string "Hello from Lambda!". Here is an python example:
~~~python
def lambda_handler(event, context):
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
~~~
One thing to note is, because of the nature of different languages, the code package size is different. And code size is a very important variable for FaaS solution performance. The smaller the code is, the faster the code be downloaded to runtime, as a result, less cold start letency. Here is a list of the code size for different languages. Before you take a reference of the results on this website, consider you own code package size as a paremeter.

| Providers | Code Size (byte) |
| :- | :- |
| .NET Core 3.1 | 226204 |
| Go 1.x | 1511695 |
| Java 11 (Corretto) | 5871 |
| Node.js 12.x | 281 |
| Ruby 2.7 | 279 |
| Python 3.8 | 283 |

    `
    return (
        <ReactMarkdown plugins={[gfm]} source={mdText} />
    )
}

export default InfoPage;