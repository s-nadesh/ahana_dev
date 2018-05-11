<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoChargePerCategory;
use common\models\CoLog;
use common\models\CoLogin;
use common\models\CoMasterCity;
use common\models\CoMasterCountry;
use common\models\CoMasterState;
use common\models\CoOrganization;
use common\models\CoResources;
use common\models\CoRolesResources;
use common\models\CoTenant;
use common\models\CoUsersBranches;
use common\models\CoUsersRoles;
use common\models\PatAppointment;
use common\models\PatDiagnosis;
use common\models\PatDsmiv;
use common\models\PatEncounter;
use common\models\PatScheduleCharge;
use common\models\AppConfiguration;
use Yii;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\ArrayHelper;
use yii\web\Controller;
use yii\web\Response;

class DefaultController extends Controller {

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className(),
            'only' => ['getnavigation', 'getconsultantcharges', 'switchbranch', 'getlog'],
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actionIndex() {
        echo "AAAAAAA";
        exit;
        return $this->render('index');
    }

    public function actionGetCountryList() {
        $list = array();
        $data = CoMasterCountry::getCountrylist();
        foreach ($data as $value => $label) {
            $list[] = array('value' => $value, 'label' => $label);
        }
        return ['countryList' => $list];
    }

    public function actionGetStateList() {
        $list = array();
        $get = Yii::$app->request->get();
        if (isset($get['country']))
            $country_id = $get['country'];
        else
            $country_id = '';
        if ($country_id != '')
            $datas = CoMasterState::find()->where(['country_id' => $country_id])->all();
        else
            $datas = CoMasterState::find()->all();

        foreach ($datas as $data) {
            $list[] = array('value' => $data->state_id, 'label' => $data->state_name, 'countryId' => $data->country_id);
        }
        return ['stateList' => $list];
    }

    public function actionGetCityList() {
        $list = array();
        $get = Yii::$app->request->get();
        if (isset($get['state']))
            $state_id = $get['state'];
        else
            $state_id = '';
        if ($state_id != '')
            $datas = CoMasterCity::find()->Where(['state_id' => $state_id])->all();
        else
            $datas = CoMasterCity::find()->all();
        foreach ($datas as $data) {
            $list[] = array('value' => $data->city_id, 'label' => $data->city_name, 'stateId' => $data->state_id);
        }
        return ['cityList' => $list];
    }

    public function actionGetTenantList() {
        $org = CoOrganization::findOne(['org_domain' => DOMAIN_PATH]);

        if (empty($org))
            return ['success' => false, 'message' => 'There is no organization assigned for this domain.'];

        $list = ArrayHelper::map($org->coActiveTenants, 'tenant_id', 'tenant_name');

        return ['tenantList' => $list, 'org_sts' => $org->status, 'success' => true];
    }

    public function actionError() {
        $exception = Yii::$app->errorHandler->exception;
        if ($exception !== null) {
            return ['success' => false, 'message' => "Error {$exception->statusCode} : {$exception->getMessage()} !!!"];
        }
    }

    public function actionGetnavigation() {
        $get = Yii::$app->request->get();
        $user_id = Yii::$app->user->identity->user->user_id;
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        $role_ids = ArrayHelper::map(CoUsersRoles::find()->where(['user_id' => $user_id])->all(), 'role_id', 'role_id');
        $resource_ids = ArrayHelper::map(CoRolesResources::find()->where(['IN', 'role_id', $role_ids])->andWhere(['tenant_id' => $tenant_id])->all(), 'resource_id', 'resource_id');

        $menus = CoRolesResources::getModuleTreeByResourcename($get['resourceName']);

        foreach ($menus as $key => $menu) {
            if (in_array($menu['value'], $resource_ids)) {
                foreach ($menu['children'] as $ckey => $child) {
                    if (in_array($child['value'], $resource_ids)) {
                        foreach ($child['children'] as $ckey2 => $child2) {
                            if (!in_array($child2['value'], $resource_ids)) {
                                unset($menus[$key]['children'][$ckey]['children'][$ckey2]);
                            }
                        }
                    } else {
                        unset($menus[$key]['children'][$ckey]);
                    }
                }
            } else {
                unset($menus[$key]);
            }
        }

        return ['navigation' => $menus[0]['children']];
    }

    public function actionGetconsultantcharges() {
        $get = Yii::$app->request->get();
        if (!empty($get)) {
            $charge_code_id = $get['consultant_id'];
            return ['success' => true, 'chargesList' => CoChargePerCategory::getConsultantCharges($charge_code_id)];
        }
    }

//    //This is only for testing CRON functionality.
//    public function actionCronchecking() {
//        $sql = "INSERT INTO co_city (state_id, city_name, status, created_by, created_at) VALUES ('2', 'Test Cron', '0', '1', NOW())";
//        \Yii::$app->db->createCommand($sql)->execute();
//    }

    public function actionDailycron() {
        $organizations = CoOrganization::find()->andWhere(['status' => '1'])->all();

        foreach ($organizations as $key => $organization) {
            foreach ($organization->coTenants as $key => $tenant) {

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, "{$organization->org_domain}/api/IRISORG/web/v1/default/updatebilling");
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, ['tenant_id' => $tenant->tenant_id]);  //Post Fields
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                $headers = array();
                $headers[] = "x-domain-path: {$organization->org_domain}";

                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                $server_output = curl_exec($ch);
                curl_close($ch);

//                print $server_output;
            }
        }
    }

    public function actionUpdatebilling() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $active_encounters = PatEncounter::find()->andWhere(['current_tenant_id' => $post['tenant_id']])->status()->unfinalized()->active()->all();

            foreach ($active_encounters as $key => $active_encounter) {
                Yii::$app->hepler->updateRecurring($active_encounter->patCurrentAdmissionExecptClinicalDischarge);
            }

            //Cancel Old Active Appointments
            $today = date("Y-m-d");
            $op_encounters = PatEncounter::find()
                    ->andWhere(['current_tenant_id' => $post['tenant_id']])
                    ->status()
                    ->active()
                    ->encounterType("OP")
                    ->andWhere(["<", "DATE(encounter_date)", $today])
                    ->all();

            foreach ($op_encounters as $op_encounter) {
                $user = CoLogin::findOne(['user_id' => $op_encounter->created_by]);
                Yii::$app->user->login($user);
                $data = array();
                $data['appt_status'] = "C";
                $data['encounter_id'] = $op_encounter->encounter_id;
                $data['status_time'] = date("H:i:s");
                $data['status_date'] = date("Y-m-d");
                $data['patient_id'] = $op_encounter->patient_id;
                $data['tenant_id'] = $post['tenant_id'];

                $model = new PatAppointment;
                $model->attributes = $data;
                $model->save(false);
                Yii::$app->user->logout();
            }
            //Run Active schedule Charge
//            $active_scheduleCharges = PatScheduleCharge::find()->tenant($post['tenant_id'])->andWhere(['cron_status' => '1'])->all();
//
//            foreach ($active_scheduleCharges as $key => $active_scheduleCharge) {
//                Yii::$app->hepler->updateOthercharges($active_scheduleCharge, $active_scheduleCharge->encounter);
//            }
        }
    }

    public function actionDailycronupdateschedule() {
        $organizations = CoOrganization::find()->andWhere(['status' => '1'])->all();

        foreach ($organizations as $key => $organization) {
            foreach ($organization->coTenants as $key => $tenant) {

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, "{$organization->org_domain}/api/IRISORG/web/v1/default/updateschedulemanually");
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, ['tenant_id' => $tenant->tenant_id]);  //Post Fields
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                $headers = array();
                $headers[] = "x-domain-path: {$organization->org_domain}";

                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                $server_output = curl_exec($ch);
                curl_close($ch);

//                print $server_output;
            }
        }
    }

    public function actionUpdateschedulemanually() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $active_scheduleCharges = PatScheduleCharge::find()->tenant($post['tenant_id'])->andWhere(['cron_status' => '1'])->all();

            foreach ($active_scheduleCharges as $key => $active_scheduleCharge) {
                Yii::$app->hepler->updateOthercharges($active_scheduleCharge, $active_scheduleCharge->encounter);
            }
        }
    }

    //Update Billing Manually Through Postman Tool.
    public function actionUpdatebillingmanually() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $status = '1';
            if (isset($post['enc_status']) && $post['enc_status'] != '') {
                $status = $post['enc_status'];
            }
            $active_encounters = PatEncounter::find()->tenant($post['tenant_id'])->status($status)->unfinalized()->active();
            if (isset($post['encounter_id']) && $post['encounter_id'] != '') {
                $active_encounters->andWhere(['encounter_id' => $post['encounter_id']]);
            }
            $active_encounters = $active_encounters->all();

            $recurr_date = '';
            if (isset($post['recurr_date']) && $post['recurr_date'] != '') {
                $recurr_date = $post['recurr_date'];
            }

            $counting = 0;
            foreach ($active_encounters as $key => $active_encounter) {
                $counting++;
                $nearest_admission = \common\models\PatAdmission::find()
                        ->andWhere(['encounter_id' => $active_encounter->encounter_id])
                        ->andWhere("DATE(status_date) <='" . $recurr_date . "'")
                        ->andWhere(['not in', 'admission_status', ['C', 'CD', 'D']])
                        ->orderBy(['created_at' => SORT_DESC])
                        ->one();

                Yii::$app->hepler->updateRecurring($nearest_admission, $recurr_date);
            }
            return 'Recurring Charges Updated ' . $counting . ' Encounters ';
        }
    }

    public function actionUpdatebillingfinalizedip() {
        $encounters = PatEncounter::find()->encounterType()->finalized()->all();
        if (!empty($encounters)) {
            foreach ($encounters as $encounter) {
                //Check Recurring Exists on that date
                $recurr_date = $encounter->finalize_date;
                $current_recurring = \common\models\PatBillingRecurring::find()
                        ->select(['SUM(charge_amount) as charge_amount', 'room_type_id'])
                        ->tenant($encounter->tenant_id)
                        ->andWhere(['encounter_id' => $encounter->encounter_id, 'recurr_date' => $recurr_date])
                        ->groupBy(['recurr_date', 'room_type_id'])
                        ->one();
                if (empty($current_recurring)) {
                    $nearest_admission = \common\models\PatAdmission::find()
                            ->andWhere(['encounter_id' => $encounter->encounter_id])
                            ->andWhere("DATE(status_date) <='" . $recurr_date . "'")
                            ->andWhere(['not in', 'admission_status', ['C', 'CD', 'D']])
                            ->orderBy(['created_at' => SORT_DESC])
                            ->one();

                    Yii::$app->hepler->updateRecurring($nearest_admission, $recurr_date);
                }
            }
        }
    }

    public function actionGetDiagnosisList() {
        $list = array();
        $data = PatDiagnosis::find()->all();
        foreach ($data as $key => $value) {
            $list[] = array('label' => $value->diag_name . '-' . $value->diag_description, 'value' => $value->diag_id);
        }
        return ['diagnosisList' => $list];
    }

    public function actionGetDsmiv($axis) {
        $list = array();
        $data = PatDsmiv::find()->andWhere(['axis' => $axis])->all();
        foreach ($data as $key => $value) {
            $list[] = array('label' => $value->code . '-' . $value->main . '-' . $value->sub);
        }
        return ['dsmivList' => $list];
    }

    public function actionSwitchbranch() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $tenant_id = $post['branch_id'];
            $tenant = CoTenant::findOne(['tenant_id' => $tenant_id]);

            UserController::Clearpharmacysetupsession();
            UserController::Setuppharmacysession($tenant_id);
            
            if (Yii::$app->user->identity->user->tenant_id == 0) {
                $login_details = CoLogin::findOne(['login_id' => Yii::$app->user->identity->login_id]);
                $login_details->logged_tenant_id = $tenant_id;
                $login_details->save(false);
                return ['success' => true, 'admin' => true, 'tenant' => $tenant, 'db_name' => Yii::$app->session['pharmacy_setup_db_name']];
            } else {
                $resources = [];
                $user_id = Yii::$app->user->identity->user->user_id;

                $branch_exists = CoUsersBranches::find()->where(['user_id' => $user_id, 'branch_id' => $tenant_id])->one();
                if (!empty($branch_exists)) {
                    $role_ids = ArrayHelper::map(CoUsersRoles::find()->where(['user_id' => $user_id])->tenant($tenant_id)->all(), 'role_id', 'role_id');
                    $resource_ids = ArrayHelper::map(CoRolesResources::find()->where(['IN', 'role_id', $role_ids])->tenant($tenant_id)->all(), 'resource_id', 'resource_id');
                    $resources = ArrayHelper::map(CoResources::find()->where(['IN', 'resource_id', $resource_ids])->all(), 'resource_url', 'resource_url');
                }
                if (!empty($resources)) {
                    $login_details = CoLogin::findOne(['login_id' => Yii::$app->user->identity->login_id]);
                    $login_details->logged_tenant_id = $tenant_id;
                    $login_details->save(false);
                }
                return ['success' => true, 'resources' => $resources, 'admin' => false, 'tenant' => $tenant, 'db_name' => Yii::$app->session['pharmacy_setup_db_name']];
            }
        }
    }

    public function actionGetlog() {
        $user_id = Yii::$app->user->identity->user->user_id;
        $log = CoLog::find()
                ->andWhere([
                    'tenant_id' => Yii::$app->user->identity->logged_tenant_id,
                    'event_trigger' => $_SERVER['HTTP_CONFIG_ROUTE']
                ])
                ->andWhere("created_by != '{$user_id}'")
                ->orderBy(['log_id' => SORT_DESC])
                ->one();
        if ($log)
            return ['success' => true, 'last_log_id' => $log->log_id];
        else
            return ['success' => true, 'last_log_id' => 0];
    }

    //Old patients create xml file inside the folder.
    public function actionTestfilecreate() {
        $patDocuments = \common\models\PatDocuments::find()->all();
        foreach ($patDocuments as $patDocument) {
            $fpath = "uploads/{$patDocument->tenant_id}/{$patDocument->patient->patient_global_int_code}";
            \yii\helpers\FileHelper::createDirectory($fpath, 0755);
            $file_name = "CH_{$patDocument->encounter_id}.xml";
            $path = \yii::getAlias('@webroot') . '/' . $fpath . '/' . $file_name;

            $myfile = fopen($path, "w") or die("Unable to open file!");
            fwrite($myfile, $patDocument->document_xml);
            fclose($myfile);
            chmod($path, 0644);

            $patDocument->xml_path = $fpath . '/' . $file_name;
            $patDocument->save(false);
        }
        return true;
    }

    public function actionUpdatebillinglog() {
        //Non Recurring Log
        $extra_concession_charges = \common\models\PatBillingExtraConcession::find()->all();
        if (!empty($extra_concession_charges)) {
            $connection = Yii::$app->client;
            $connection->open();

            foreach ($extra_concession_charges as $charge) {
                if ($charge->ec_type == 'C') {
                    $header = 'Professional Charges ( ' . $charge->user->title_code . ' ' . $charge->user->name . ')';
                } else {
                    $header = 'Procedure Charges ( ' . $charge->roomchargesubcategory->charge_subcat_name . ')';
                }

                //Extra amount Log
                if ($charge->extra_amount != '0.00') {
                    $activity = "Extra Amount {$charge->extra_amount} (Add)";

                    $sql = "INSERT INTO pat_billing_log(tenant_id, patient_id, encounter_id, date_time, log_type, header, activity, created_by, created_at, modified_by, modified_at) VALUES({$charge->tenant_id},'{$charge->patient_id}', '{$charge->encounter_id}', '{$charge->created_at}', 'N', '{$header}', '{$activity}', '{$charge->created_by}', '{$charge->created_at}', '{$charge->created_by}', '{$charge->created_at}')";

                    $command = $connection->createCommand($sql);
                    $command->execute();
                }

                //Concession amount Log
                if ($charge->concession_amount != '0.00') {
                    $activity = "Concession Amount {$charge->concession_amount} (Add)";

                    $sql = "INSERT INTO pat_billing_log(tenant_id, patient_id, encounter_id, date_time, log_type, header, activity, created_by, created_at, modified_by, modified_at) VALUES({$charge->tenant_id},'{$charge->patient_id}', '{$charge->encounter_id}', '{$charge->created_at}', 'N', '{$header}', '{$activity}', '{$charge->created_by}', '{$charge->created_at}', '{$charge->created_by}', '{$charge->created_at}')";

                    $command = $connection->createCommand($sql);
                    $command->execute();
                }
            }

            $connection->close();
        }

        //Recurring Log
        $encounters = PatEncounter::find()->where('concession_amount != 0.00')->all();
        if (!empty($encounters)) {
            $connection = Yii::$app->client;
            $connection->open();
            foreach ($encounters as $encounter) {
                $activity = "Concession amount {$encounter->concession_amount} ( Add )";
                $sql = "INSERT INTO pat_billing_log(tenant_id, patient_id, encounter_id, date_time, log_type, header, activity, created_by, created_at, modified_by, modified_at) VALUES({$encounter->tenant_id},'{$encounter->patient_id}', '{$encounter->encounter_id}', '{$encounter->modified_at}', 'R', 'Room Concession', '{$activity}', '{$charge->modified_by}', '{$charge->modified_at}', '{$charge->modified_by}', '{$charge->modified_at}')";

                $command = $connection->createCommand($sql);
                $command->execute();
            }
            $connection->close();
        }
    }

    public function expiryDate($date) {
        $expMY = $date;
        $expDate = '01/' . $expMY;
        $expArray = explode('/', $expDate);
        if ($expArray[2]) {
            $dt = date_create_from_format('y', $expArray[2]);
            $expArray[2] = $dt->format('Y');
            $date = implode('-', $expArray);
            return $date = date('Y-m-d', strtotime($date));
        }
        return false;
    }

    public function actionOpeningstockadjustlog() {
        $connection = Yii::$app->client_pharmacy;
        $connection->open();

        $sql = "SELECT *
                FROM test_os_batch_wise a
                  LEFT JOIN pha_product b
                    ON b.product_name = a.Name
                    AND b.tenant_id = a.tenant_id
                WHERE a.`status` = 1
                GROUP BY a.id";
        $command = $connection->createCommand($sql);
        $all = $command->queryAll();

        foreach ($all as $result) {
            $findBatch = "SELECT * FROM pha_product_batch WHERE tenant_id = :tenant_id AND product_id = :product_id AND batch_no = :batch_no AND expiry_date = :expiry_date";
            $command = $connection->createCommand($findBatch);
            $command->bindValues([
                ':tenant_id' => $result['tenant_id'],
                ':product_id' => $result['product_id'],
                ':batch_no' => $result['Batch'],
                ':expiry_date' => $this->expiryDate($result['ExpiryMy']),
            ]);
            $batch = $command->queryAll();
            if (!empty($batch)) {
                $batch = $batch[0];
                $insert = "INSERT INTO pha_stock_adjust_log(tenant_id, batch_id, adjust_date_time, adjust_from, adjust_to, adjust_qty, created_by, created_at, modified_by, modified_at) VALUES ('{$batch['tenant_id']}', '{$batch['batch_id']}', '{$batch['created_at']}', '0', '{$result['Total']}' , '{$result['Total']}', '{$batch['created_by']}', '{$batch['created_at']}', '{$batch['created_by']}', '{$batch['created_at']}')";
                $command = $connection->createCommand($insert);
                $command->execute();
            }
        }

        $connection->close();
    }

    //Below action not need, I removed the corresponding table from DB.
//    public function actionUpdatewrongbatch() {
//        $connection = Yii::$app->client;
//        $connection->open();
//
//        $sql = "SELECT *
//                FROM batch_no_replace a
//                  LEFT JOIN pha_product b
//                    ON b.product_name = a.Name
//                    AND b.tenant_id = a.tenant_id                
//                GROUP BY a.id";
//        $command = $connection->createCommand($sql);
//        $all = $command->queryAll();
//$c = 1;
//        foreach ($all as $result) {
//            if ($result['product_id'] != '') {
//                $findBatch = "SELECT * FROM pha_product_batch WHERE tenant_id = :tenant_id AND product_id = :product_id AND batch_no = :batch_no AND expiry_date = :expiry_date";
//                $command = $connection->createCommand($findBatch);
//                $command->bindValues([
//                    ':tenant_id' => $result['tenant_id'],
//                    ':product_id' => $result['product_id'],
//                    ':batch_no' => $result['wrong_batch'],
//                    ':expiry_date' => $this->expiryDate($result['ExpiryMy']),
//                ]);
//                $batch = $command->queryAll();
//                if (!empty($batch)) {
//                    
//                    $batch = $batch[0];
//                    $update = "Update pha_product_batch set batch_no = '{$result['Batch']}' where batch_id = '{$batch['batch_id']}'";
//                    $command = $connection->createCommand($update);
//                    $command->execute();
//                    $c++;
//                }
//            }
//        }
//echo $c;
//        $connection->close();
//    }
}
