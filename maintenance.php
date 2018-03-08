<!doctype html>
<title>Site Maintenance</title>
<style>
    body { text-align: center; padding: 150px; }
    h1 { font-size: 50px; }
    body { font: 20px Helvetica, sans-serif; color: #333; }
    article { display: block; text-align: left; width: 650px; margin: 0 auto; }
    a { color: #dc8100; text-decoration: none; }
    a:hover { color: #333; text-decoration: none; }
</style>
<?php
$servername = "http://" . $_SERVER['SERVER_NAME'];
?>
<script type="text/javascript">
    setTimeout(function () {
        window.location.href = "<?php echo $servername ?>" ; //will redirect to your blog page (an ex: blog.html)
    }, 30000);
</script>


<article>
    <h1>We&rsquo;ll be back soon!</h1>
    <!--<h3>Please visit</h3> <a href="http://medizura.com">http://medizura.com</a>-->
    <h3>IP Address: <?=$_SERVER['REMOTE_ADDR']?></h3>
    <div>
        <p>Sorry for the inconvenience but we&rsquo;re performing some maintenance at the moment. </p>
        <p>&mdash; The ARK INFOTEC Team</p>
    </div>
</article>