<?php

/*
Plugin Name: Pijs
Description: A plugin that creates the components of pijs apps
Version: 1.0
Author: Andy Stubbs
*/

require( '_code-example/pijs-code-example.php' );
//require( '_docs/pijs-docs.php' );
require( '_my-editor/pijs-editor.php' );

new Pijs_Code_Example();
//new Pijs_Docs();
new Pijs_Editor();