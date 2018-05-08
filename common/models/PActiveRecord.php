<?php

namespace common\models;

use Yii;
use yii\db\ActiveQuery;
use yii\db\Connection;
use common\models\AppConfiguration;
use common\models\CoTenant;

class PActiveRecord extends RActiveRecord {

    public static function getDb() {
        $pharmacy_connection = '';
        $request = Yii::$app->request;
        $get_path = $request->pathInfo;
        $get_path = preg_replace('/[0-9]+/', '', $get_path);
        $product_path = array("v/pharmacyproduct/getgenericlistbydrugclass", "v/pharmacyproduct/getdrugproductbygeneric", "v/pharmacyproduct/getproductlistbygeneric",
            "v/pharmacyproduct", "v/pharmacydrugclass", "v/genericname", "v/patientprescription/getdiagnosis", "v/pharmacyproduct/getprescription", "v/pharmacyproducts/");

        if (in_array("$get_path", $product_path)) {
            $get_action = $request->get('page_action');

            if ($get_action == 'branch_pharmacy') {
                $tenant_id = Yii::$app->session['pharmacy_setup_tenant_id'];

                //Session pharmacy_tenant & pharmacy_tenant_db is current opening organization tenant_id & database
                //Starting pharmacy_setup_ session is set to user login function.

                if ($tenant_id) {
                    if ((isset(Yii::$app->session['pharmacy_tenant']) && (Yii::$app->session['pharmacy_tenant'] != $tenant_id)) || empty(Yii::$app->session['pharmacy_tenant'])) {
                        if (Yii::$app->user->identity->user->org_id != Yii::$app->session['pharmacy_setup_org_id']) {
                            $host_name = Yii::$app->session['pharmacy_setup_host_name'];
                            $db_name = Yii::$app->session['pharmacy_setup_db_name'];
                            
                            $conn_dsn = "mysql:host={$host_name};dbname={$db_name}";
                            $conn_username = Yii::$app->session['pharmacy_setup_db_username'];
                            $conn_password = Yii::$app->session['pharmacy_setup_db_password'];
                                
                            $pharmacy_connection = new Connection([
                                'dsn' => $conn_dsn,
                                'username' => $conn_username,
                                'password' => $conn_password,
                                'charset' => 'utf8'
                            ]);
                            $phar_connection = $pharmacy_connection->open();
                            Yii::$app->session['pharmacy_tenant'] = $tenant_id;
                            Yii::$app->session['pharmacy_tenant_db'] = $pharmacy_connection;
                        }
                    } else {
                        $pharmacy_connection = Yii::$app->session['pharmacy_tenant_db'];
                    }
                }
            }
        }
        if ($pharmacy_connection) {
            return Yii::$app->session['pharmacy_tenant_db'];
        } else {
            return Yii::$app->client_pharmacy;
        }
    }

}
