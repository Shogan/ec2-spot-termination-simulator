# ec2-spot-termination-simulator

A very simple web API endpoint that returns a 200 from the endpoint that the EC2 metadata service on Amazon EC2 instances usually serves spot termination times on.

You can use this to simulate a working EC2 metadata spot termination endpoint response.

When a spot instance is not scheduled for termination, this endpoint (http://169.254.169.254/latest/meta-data/spot/termination-time), usually responds with an HTTP 404 not found.

However, if a spot instance is scheduled for termination, this endpoint responds with an HTTP 200 and the timestamp of when the termination will occur.

Some spot instance interruption handlers such as https://github.com/kube-aws/kube-spot-termination-notice-handler poll this metadata URL endpoint looking for a non 404 response. Once found, they'll drain the node and cordon it off in preparation for the instance to be terminated in the next 2 minutes.

This simple web app will fake the response to become a 200 on http://169.254.169.254/latest/meta-data/spot/termination-time and so the interrupt handler will take action immediately.

There is a trick to get this accessible on a node though.

Deploy the web app and kubernetes service:

```
kubectl apply -f ./simple-k8s-deployment.yaml
```

Then list the service and the pod (and find the kubernetes node the pod is running on):

```
kubectl get svc ec2-spot-termination-simulator
kubectl get pod spot-term-simulator-xxxxxx -o wide
```

Take note of the NodePort the service is listening on for the Kubernetes node. E.g. port `30626`.

SSH onto the Kubernetes node and run:

```
sudo ifconfig lo:0 169.254.169.254 up
sudo socat TCP4-LISTEN:80,fork TCP4:127.0.0.1:30626
```

* This creates an alias for the localhost interface at 169.254.169.254, effectively taking over the EC2 metadata service and sending that to 127.0.0.1 instead.
* socat is used to forward port 80 traffic (usually destined to the EC2 metadata service) across to 127.0.0.1 on the NodePort `30626`. This is where the ec2-spot-termination-simulator pod is running on this host.

At this point doing:

```
curl -i http://169.254.169.254/latest/meta-data/spot/termination-time
```

Should return a 200 OK response with a message from the web app / service.

kube-spot-termination-notice-handler should now pick this up immediately and drain/cordon the node. (However it won't actually be terminated as this was of course just a simulated termination).

## Notes

I tried various iptable rules to forward traffic from 169.254.169.254 to the NodePort and web service, however could not get iptables to work without the traffic going down a blackhole. In the end the combination of ifconfig and socat worked well.