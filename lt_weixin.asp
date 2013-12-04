<%@ language="javascript"%>
<%
var echoString = Request.QueryString("echostr");

Response.write(echoString)
%>