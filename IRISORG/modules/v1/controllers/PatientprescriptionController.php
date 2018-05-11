<?php

namespace IRISORG\modules\v1\controllers;

use common\models\AppConfiguration;
use common\models\PatPatient;
use common\models\PatPrescription;
use common\models\PatPrescriptionFrequency;
use common\models\PatPrescriptionItems;
use common\models\PatPrescriptionRoute;
use common\models\PhaDescriptionsRoutes;
use common\models\PatDiagnosis;
use common\models\VDocuments;
use common\models\PatDocumentTypes;
use common\models\PatDocuments;
use common\models\PatVitals;
use common\models\PatPastMedical;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Query;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientprescriptionController extends ActiveController {

    public $modelClass = 'common\models\PatPrescription';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PatPrescription::find()->where(['pres_id' => $id])->one();
            $model->remove();

//            //Remove all related records
//            foreach ($model->room as $room) {
//                $room->remove();
//            }
//            //

            return ['success' => true];
        }
    }

    public function actionSaveprescription() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post) && !empty($post['prescriptionItems'])) {

            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $appConfiguration = AppConfiguration::find()
                    ->andWhere(['<>', 'value', 0])
                    ->andWhere(['tenant_id' => $tenant_id, 'code' => 'PB'])
                    ->one();
            
            if (!empty($appConfiguration) && !empty(Yii::$app->session['pharmacy_setup_tenant_id'])) {
                if ($appConfiguration['value'] != Yii::$app->session['pharmacy_setup_tenant_id']) {
                    UserController::Clearpharmacysetupsession();
                    UserController::Setuppharmacysession($tenant_id);
                    return ['success' => false, 'message' => 'Pharmacy Branch mismatch, Kindly check application settings.', 'page_refresh' => true];
                }
            }
            
            $model = new PatPrescription;
            if (isset($post['pres_id'])) {
                $prescription = PatPrescription::find()->tenant()->andWhere(['pres_id' => $post['pres_id']])->one();
                if (!empty($prescription))
                    $model = $prescription;
            }

            $model->attributes = $post;
            if (!empty($post['diag_text']) && empty($model->diag_id)) {
                $diag_model = new PatDiagnosis();
                $diag_model->diag_description = $post['diag_text'];
                $diag_model->save(false);
                $model->diag_id = $diag_model->diag_id;
            }
            $valid = $model->validate();

            foreach ($post['prescriptionItems'] as $key => $item) {
                $item_model = new PatPrescriptionItems();
                $item_model->scenario = 'saveform';
                $item_model->attributes = $item;
                $valid = $item_model->validate() && $valid;
                if (!$valid)
                    break;
            }

            if ($valid) {
                $model->save(false);

                $item_ids = [];
                foreach ($post['prescriptionItems'] as $key => $item) {
                    $item_model = new PatPrescriptionItems();
                    //Edit Mode
                    if (isset($item['pat_prescription_item'])) {
                        $presc_item = PatPrescriptionItems::find()->tenant()->andWhere(['pres_item_id' => $item['pat_prescription_item']])->one();
                        if (!empty($presc_item))
                            $item_model = $presc_item;
                    }
                    $item_model->pres_id = $model->pres_id;
                    $item_model->consultant_id = $model->consultant_id;
                    $item_model->attributes = $item;
                    $item_model->setFrequencyId($item);
                    $item_model->setRouteId();
                    $item_model->save(false);
                    $item_ids[$item_model->pres_item_id] = $item_model->pres_item_id;
                }

                //Delete Prescription Items
                if (!empty($item_ids)) {
                    $delete_ids = array_diff($model->getPrescriptionItemIds(), $item_ids);

                    foreach ($delete_ids as $delete_id) {
                        $item = PatPrescriptionItems::find()->tenant()->andWhere(['pres_item_id' => $delete_id])->one();
                        $item->remove();
                    }
                }

                $consult_name = '';
                if (isset($model->consultant)) {
                    $consult_name = $model->consultant->title_code . $model->consultant->name;
                }
                return ['success' => true, 'pres_id' => $model->pres_id, 'date' => date('d-M-Y H:i'), 'model' => ['consultant_name' => $consult_name, 'consultant_id' => $model->consultant_id]];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model, $item_model])];
            }
        } else {
            return ['success' => false, 'message' => 'Prescriptions cannot be blank'];
        }
    }

    public function actionGetpreviousprescription() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['patient_id'])) {
            $offset = abs($get['pageIndex'] - 1) * $get['pageSize'];
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            if (isset($get['encounter_id'])) {
                $encounter_id = $get['encounter_id'];
                $data = PatPrescription::find()->tenant()
                        ->active()
                        ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                        ->andWhere(['encounter_id' => $encounter_id])
                        ->orderBy(['created_at' => SORT_DESC])->limit($get['pageSize'])
                        ->offset($offset)
                        ->all();
                $totalCount = PatPrescription::find()->tenant()
                        ->active()
                        ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                        ->andWhere(['encounter_id' => $encounter_id])
                        ->orderBy(['created_at' => SORT_DESC])
                        ->limit($get['pageSize'])
                        ->offset($offset)
                        ->count();
            } else {
                if (isset($get['date']) && $get['date'] != "") {
                    $pres_date = $get['date'];
                    $data = PatPrescription::find()->tenant()
                            ->active()
                            ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                            ->andWhere(['DATE(pres_date)' => $pres_date])
                            ->orderBy(['created_at' => SORT_DESC])
                            ->limit($get['pageSize'])
                            ->offset($offset)
                            ->all();
                    $totalCount = PatPrescription::find()->tenant()
                            ->active()
                            ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                            ->andWhere(['DATE(pres_date)' => $pres_date])
                            ->orderBy(['created_at' => SORT_DESC])
                            ->limit($get['pageSize'])
                            ->offset($offset)
                            ->count();
                } else {
                    $data = PatPrescription::find()->tenant()
                            ->active()
                            ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                            ->orderBy(['created_at' => SORT_DESC])
                            ->limit($get['pageSize'])
                            ->offset($offset)
                            ->all();
                    $totalCount = PatPrescription::find()->tenant()
                            ->active()
                            ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                            ->orderBy(['created_at' => SORT_DESC])
                            ->limit($get['pageSize'])
                            ->offset($offset)
                            ->count();
                }
            }
            return ['success' => true, 'prescriptions' => $data, 'totalCount' => $totalCount];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetsaleprescription() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['patient_id'])) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            if (isset($get['encounter_id'])) {
                $encounter_id = $get['encounter_id'];
                $data = PatPrescription::find()
                        ->tenant()
                        ->active()
                        ->where("patient_id IN ($all_patient_id->allpatient)")
                        ->andWhere([
                            'encounter_id' => $encounter_id
                        ])
                        ->orderBy(['created_at' => SORT_DESC])
                        ->one();
            }
            return ['success' => true, 'prescription' => $data];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    /* pharmacy_prodesc.js */

    public function actionGetactiveroutes() {
        $routes = PatPrescriptionRoute::find()->tenant()->active()->status()->all();
        return ['success' => true, 'routes' => $routes];
    }

    public function actionGetdescriptionroutes() {
        $id = Yii::$app->request->get('id');
        if (!empty($id)) {
            $routes = PhaDescriptionsRoutes::find()->tenant()->andWhere(['description_id' => $id])->all();
            return ['success' => true, 'routes' => $routes];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetconsultantfreq() {
        $get = Yii::$app->request->get();
        if (!empty($get)) {
            $freq = PatPrescriptionFrequency::find()
                    ->tenant()
                    ->status()
                    ->active()
                    ->andWhere(['consultant_id' => $get['consultant_id']])
                    ->orderBy(['modified_at' => SORT_DESC])
                    ->all();
            return ['success' => true, 'freq' => $freq];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetconsultantnoofdays() {
        $get = Yii::$app->request->get();
        if (!empty($get)) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $connection = Yii::$app->client;
            $command = $connection->createCommand("SELECT pat_prescription_items.number_of_days, MAX(pat_prescription_items.created_at) AS 'created_at' FROM pat_prescription LEFT JOIN pat_prescription_items ON pat_prescription_items.pres_id = pat_prescription.pres_id WHERE (pat_prescription.tenant_id=:tenant_id) AND (pat_prescription.deleted_at=:deleted_at) AND (pat_prescription.status=:status) AND (pat_prescription.consultant_id=:consultant_id) GROUP BY pat_prescription_items.number_of_days ORDER BY pat_prescription.created_at DESC ", [':tenant_id' => $tenant_id, ':deleted_at' => '0000-00-00 00:00:00', ':status' => '1', ':consultant_id' => $get['consultant_id']]);
            $result = $command->queryAll();
            $connection->close();
            return ['success' => true, 'noofdays' => $result];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionFrequencyremove() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $frequency = PatPrescriptionFrequency::find()->tenant()->andWhere(['freq_id' => $post['id'], 'consultant_id' => $post['consultant_id']])->one();
            $frequency->status = 0;
            $frequency->save(false);
            return ['success' => true];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetdiagnosis() {
        $get = Yii::$app->getRequest()->get();
        $text = $get['diag_description'];
        $Diag = PatDiagnosis::find()
                ->andFilterWhere([
                    'or',
                        ['like', 'diag_name', $text],
                        ['like', 'diag_description', $text],
                ])
                ->limit(25)
                ->all();
        return $Diag;
    }

    public function actionUpdatetabsetting() {
        $post = Yii::$app->getRequest()->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $unset_configs = AppConfiguration::updateAll(['value' => '0'], "tenant_id = {$tenant_id} AND `code` IN ('PTV','PTR','PTN')");
        if (!empty($post)) {
            foreach ($post as $value) {
                $tab_name = $value['name'];
                $tab_array[] = "'$tab_name'";
            }
            $tab = implode(',', $tab_array);
            $config = AppConfiguration::updateAll(['value' => '1'], "tenant_id = {$tenant_id} AND `key` IN ($tab)");
        }
        return ['success' => true];
    }

    public function actionLoadprescriptionvaluefromdatabase() {
        $data = Yii::$app->getRequest()->post();
        return $this->preparePreviousPrescriptionXml($data['xml'], $data['table_id'], $data['encounter']);
    }

    public function actionLoadvitalvaluefromdatabase() {
        $data = Yii::$app->getRequest()->post();
        return $this->preparePreviousVitalXml($data['xml'], $data['table_id'], $data['encounter'], $data['add_vital']);
    }

    public function actionSavemedicaldocument() {
        $form = Yii::$app->getRequest()->post();
        $post = [];
        foreach ($form as $key => $value) {
            if (isset($value['value'])) {
                if (strpos($value['name'], '[]') !== false) {
                    $field_name = str_replace("[]", "", $value['name']);
                    $post[$field_name][] = str_replace("&nbsp;", "&#160;", $value['value']);
                } else {
                    if ($value['name'] != 'history_presenting_illness') {
                        $post[$value['name']] = str_replace(["&nbsp;", "&"], ["&#160;", "&amp;"], $value['value']);
                    } else {
                        $post[$value['name']] = $value['value'];
                    }
                }
            } else {
                $post[$value['name']] = '';
            }
        }
        $patient = PatPatient::getPatientByGuid($post['patient_id']);
        $type = 'MCH';
        $case_history_xml = PatDocumentTypes::getDocumentType($type);

        $doc_exists = '';
        if (!empty($post['doc_id'])) {
            $doc_exists = PatDocuments::find()->tenant()->andWhere([
                        'patient_id' => $patient->patient_id,
                        'doc_type_id' => $case_history_xml->doc_type_id,
                        'encounter_id' => $post['encounter_id'],
                        'doc_id' => $post['doc_id'],
                    ])->one();
        }

        if (!empty($doc_exists)) {
            $patient_document = $doc_exists;
            $xml = $doc_exists->document_xml;
        } else {
            $patient_document = new PatDocuments;
            $xml = $case_history_xml->document_xml;
        }
        if (isset($post['scenario']) && $post['scenario']) {
            $patient_document->scenario = $type;
        }

        $attr = [
            'patient_id' => $patient->patient_id,
            'encounter_id' => $post['encounter_id'],
            'doc_type_id' => $case_history_xml->doc_type_id
        ];

        $attr = array_merge($post, $attr);
        $patient_document->attributes = $attr;

        $patient_document->patient_id = $patient->patient_id;
        $patient_document->encounter_id = $post['encounter_id'];
        $patient_document->doc_type_id = $case_history_xml->doc_type_id;

        if (!empty($post['past_medical_notes'])) {
            $check_past_medical = PatPastMedical::find()->andWhere(['doc_id' => $post['doc_id']])->one();
            if (!empty($check_past_medical)) {
                $pastMedical = $check_past_medical;
            } else {
                $pastMedical = new PatPastMedical();
            }
            $pastMedical->patient_id = $patient->patient_id;
            $pastMedical->encounter_id = $post['encounter_id'];
            $pastMedical->past_medical = $post['past_medical_notes'];
            $pastMedical->doc_id = $patient_document->doc_id;
            $pastMedical->save(false);
        }

        if ($patient_document->validate() || $post['novalidate'] == 'true' || $post['novalidate'] == '1') {
            $result = $this->prepareXml($xml, $post);
            //if (empty($doc_exists)) {
            $result = $this->preparePreviousPrescriptionXml($result, 'RGprevprescription', $post['encounter_id']);
            $result = $this->preparePreviousVitalXml($result, 'RGvital', $post['encounter_id'], true);
            //}
            if (isset($post['button_id'])) {
                if ($post['table_id'] == 'TBicdcode') {
                    $result = $this->prepareIcdCodeXml($result, $post['table_id'], $post['rowCount']);
                }
            }
            $patient_document->document_xml = $result;
            $patient_document->save(false);
            //Check Non empty all vital fileds and insert the new patvitals
            if (!$post['novalidate']) {
                if ((!empty($post['txttemperature'])) || (!empty($post['txtbp_systolic'])) || (!empty($post['txtbp_diastolic'])) || (!empty($post['txtpulse_rate'])) || (!empty($post['txtweight'])) || (!empty($post['txtheight'])) || (!empty($post['txtsp02'])) || (!empty($post['txtpain_score']))) {
                    $vitals = new PatVitals();
                    $vitals->patient_id = $patient->patient_id;
                    $vitals->encounter_id = $post['encounter_id'];
                    $vitals->vital_time = date("Y-m-d H:i:s");
                    $vitals->temperature = $post['txttemperature'];
                    $vitals->blood_pressure_systolic = $post['txtbp_systolic'];
                    $vitals->blood_pressure_diastolic = $post['txtbp_diastolic'];
                    $vitals->pulse_rate = $post['txtpulse_rate'];
                    $vitals->height = $post['txtheight'];
                    $vitals->weight = $post['txtweight'];
                    $vitals->sp02 = $post['txtsp02'];
                    $vitals->pain_score = $post['txtpain_score'];
                    if ($vitals->validate()) {
                        $vitals->save(false);
                    } else {
                        return ['success' => false, 'message' => Html::errorSummary([$vitals])];
                    }
                }
            }
            return ['success' => true, 'xml' => $result, 'doc_id' => $patient_document->doc_id];
        } else {
            return ['success' => false, 'message' => Html::errorSummary([$patient_document])];
        }
    }

    protected function preparePreviousPrescriptionXml($xml, $table_id, $encounterid) {
        $xmlLoad = simplexml_load_string($xml);
        foreach ($xmlLoad->children() as $group) {
            foreach ($group->PANELBODY->FIELD as $x) {
                if ($x->attributes()->type == 'RadGrid' && $x->attributes()->AddButtonTableId == $table_id) {
                    unset($x->COLUMNS);
                    if (!empty($encounterid)) {
                        $prescriptions = PatPrescription::find()->joinWith(['patPrescriptionItems', 'patPrescriptionItems.freq', 'patPrescriptionItems.presRoute'])->tenant()->active()
                                ->andWhere(['encounter_id' => $encounterid])
                                ->orderBy(['created_at' => SORT_DESC])
                                ->limit(100)
                                ->all();
                        if (!empty($prescriptions)) {
                            foreach ($prescriptions as $pres) {
                                foreach ($pres->patPrescriptionItems as $key => $value) {

                                    $pres_text_box = 'txtprescriptiondate' . $key;
                                    $product_box = 'txtproductname' . $key;
                                    $generic_box = 'txtgenericname' . $key;
                                    $drug_box = 'txtdrugname' . $key;
                                    $route_box = 'txtroute' . $key;
                                    $frequency_box = 'txtfrequency' . $key;
                                    $noofdays_box = 'txtnoofdays' . $key;
                                    $txtaf_bf_box = 'txtaf/bf' . $key;
                                    $pres_date = date("d-m-Y g:i A", strtotime($value['created_at']));

                                    $value['product_name'] = str_replace(["&nbsp;", "&"], ["&#160;", "&amp;"], $value['product_name']);
                                    $value['generic_name'] = str_replace(["&nbsp;", "&"], ["&#160;", "&amp;"], $value['generic_name']);
                                    $value['drug_name'] = str_replace(["&nbsp;", "&"], ["&#160;", "&amp;"], $value['drug_name']);

                                    $columns = $x->addChild('COLUMNS');

                                    $field20 = $columns->addChild('FIELD');
                                    $field20->addAttribute('id', $pres_text_box);
                                    $field20->addAttribute('type', 'label');

                                    $properties_date1 = $field20->addChild('PROPERTIES');

                                    $property_date1 = $properties_date1->addChild('PROPERTY', $pres_text_box);
                                    $property_date1->addAttribute('name', 'id');

                                    $property_date2 = $properties_date1->addChild('PROPERTY', $pres_text_box);
                                    $property_date2->addAttribute('name', 'name');

                                    $property_date3 = $properties_date1->addChild('PROPERTY', 'form-control');
                                    $property_date3->addAttribute('name', 'class');

                                    $property_date4 = $properties_date1->addChild('PROPERTY', $pres_date);
                                    $property_date4->addAttribute('name', 'value');

                                    //Product box added
                                    $medicine_name = $value['product_name'] . "(" . $value['generic_name'] . ")";
                                    $field1 = $columns->addChild('FIELD');
                                    $field1->addAttribute('id', $product_box);
                                    $field1->addAttribute('type', 'label');

                                    $properties1 = $field1->addChild('PROPERTIES');

                                    $property1 = $properties1->addChild('PROPERTY', $product_box);
                                    $property1->addAttribute('name', 'id');

                                    $property2 = $properties1->addChild('PROPERTY', $product_box);
                                    $property2->addAttribute('name', 'name');

                                    $property3 = $properties1->addChild('PROPERTY', 'form-control');
                                    $property3->addAttribute('name', 'class');

                                    $property4 = $properties1->addChild('PROPERTY', $medicine_name);
                                    $property4->addAttribute('name', 'value');

                                    //Generic Text Box
//                                    $field12 = $columns->addChild('FIELD');
//                                    $field12->addAttribute('id', $generic_box);
//                                    $field12->addAttribute('type', 'label');
//
//                                    $properties12 = $field12->addChild('PROPERTIES');
//
//                                    $property12 = $properties12->addChild('PROPERTY', $generic_box);
//                                    $property12->addAttribute('name', 'id');
//
//                                    $property22 = $properties12->addChild('PROPERTY', $generic_box);
//                                    $property22->addAttribute('name', 'name');
//
//                                    $property32 = $properties12->addChild('PROPERTY', 'form-control');
//                                    $property32->addAttribute('name', 'class');
//
//                                    $property42 = $properties12->addChild('PROPERTY', $value['generic_name']);
//                                    $property42->addAttribute('name', 'value');
                                    //Drug Text Box
//                                    $field13 = $columns->addChild('FIELD');
//                                    $field13->addAttribute('id', $drug_box);
//                                    $field13->addAttribute('type', 'label');
//
//                                    $properties13 = $field13->addChild('PROPERTIES');
//
//                                    $property13 = $properties13->addChild('PROPERTY', $drug_box);
//                                    $property13->addAttribute('name', 'id');
//
//                                    $property23 = $properties13->addChild('PROPERTY', $drug_box);
//                                    $property23->addAttribute('name', 'name');
//
//                                    $property33 = $properties13->addChild('PROPERTY', 'form-control');
//                                    $property33->addAttribute('name', 'class');
//
//                                    $property43 = $properties13->addChild('PROPERTY', $value['drug_name']);
//                                    $property43->addAttribute('name', 'value');
                                    //Route Text Box
//                                    $field14 = $columns->addChild('FIELD');
//                                    $field14->addAttribute('id', $route_box);
//                                    $field14->addAttribute('type', 'label');
//
//                                    $properties14 = $field14->addChild('PROPERTIES');
//
//                                    $property14 = $properties14->addChild('PROPERTY', $route_box);
//                                    $property14->addAttribute('name', 'id');
//
//                                    $property24 = $properties14->addChild('PROPERTY', $route_box);
//                                    $property24->addAttribute('name', 'name');
//
//                                    $property34 = $properties14->addChild('PROPERTY', 'form-control');
//                                    $property34->addAttribute('name', 'class');
//
//                                    $property44 = $properties14->addChild('PROPERTY', $value->presRoute->route_name);
//                                    $property44->addAttribute('name', 'value');
                                    //Frequency Text Box
                                    $field15 = $columns->addChild('FIELD');
                                    $field15->addAttribute('id', $frequency_box);
                                    $field15->addAttribute('type', 'label');

                                    $properties15 = $field15->addChild('PROPERTIES');

                                    $property15 = $properties15->addChild('PROPERTY', $frequency_box);
                                    $property15->addAttribute('name', 'id');

                                    $property25 = $properties15->addChild('PROPERTY', $frequency_box);
                                    $property25->addAttribute('name', 'name');

                                    $property35 = $properties15->addChild('PROPERTY', 'form-control');
                                    $property35->addAttribute('name', 'class');

                                    $property45 = $properties15->addChild('PROPERTY', $value->freq->freq_name);
                                    $property45->addAttribute('name', 'value');

                                    //Drug Text Box
                                    $field16 = $columns->addChild('FIELD');
                                    $field16->addAttribute('id', $noofdays_box);
                                    $field16->addAttribute('type', 'label');

                                    $properties16 = $field16->addChild('PROPERTIES');

                                    $property16 = $properties16->addChild('PROPERTY', $noofdays_box);
                                    $property16->addAttribute('name', 'id');

                                    $property26 = $properties16->addChild('PROPERTY', $noofdays_box);
                                    $property26->addAttribute('name', 'name');

                                    $property36 = $properties16->addChild('PROPERTY', 'form-control');
                                    $property36->addAttribute('name', 'class');

                                    $property46 = $properties16->addChild('PROPERTY', $value['number_of_days']);
                                    $property46->addAttribute('name', 'value');

                                    //Drug Text Box
                                    $field17 = $columns->addChild('FIELD');
                                    $field17->addAttribute('id', $txtaf_bf_box);
                                    $field17->addAttribute('type', 'label');

                                    $properties17 = $field17->addChild('PROPERTIES');

                                    $property17 = $properties17->addChild('PROPERTY', $txtaf_bf_box);
                                    $property17->addAttribute('name', 'id');

                                    $property27 = $properties17->addChild('PROPERTY', $txtaf_bf_box);
                                    $property27->addAttribute('name', 'name');

                                    $property37 = $properties17->addChild('PROPERTY', 'form-control');
                                    $property37->addAttribute('name', 'class');

                                    $property47 = $properties17->addChild('PROPERTY', $value['food_type']);
                                    $property47->addAttribute('name', 'value');
                                }
                            }
                        }
                    }
                }
            }
        }
        $xml = $xmlLoad->asXML();
        return $xml;
    }

    protected function preparePreviousVitalXml($xml, $table_id, $encounterid, $vitalaction) {
        $xmlLoad = simplexml_load_string($xml);
        foreach ($xmlLoad->children() as $group) {
            foreach ($group->PANELBODY->FIELD as $x) {
                if ($x->attributes()->type == 'RadGrid' && $x->attributes()->AddButtonTableId == $table_id) {
                    unset($x->COLUMNS);
                    if (!empty($encounterid)) {
                        $vitals = PatVitals::find()->tenant()->active()
                                        ->andWhere(['encounter_id' => $encounterid])->orderBy(['created_at' => SORT_DESC])->all();
                        if (!empty($vitals)) {
                            foreach ($vitals as $key => $value) {
                                $vital_date = date("d-m-Y g:i A", strtotime($value['vital_time']));
                                $vital_date_box = 'txtvitaltime' . $key;
                                $temperature_box = 'txttemperature' . $key;
                                $bp_systolic_box = 'txtbp_systolic' . $key;
                                $bp_diastolic_box = 'txtbp_diastolic' . $key;
                                $pulse_rate_box = 'txtpulse_rate' . $key;
                                $weight_box = 'txtweight' . $key;
                                $height_box = 'txtheight' . $key;
                                $sp02_box = 'txtsp02' . $key;
                                $pain_score_box = 'txtpain_score' . $key;
                                //$bmi_box = 'txtbmi' . $key;

                                $columns = $x->addChild('COLUMNS');

                                //Vital date time
                                $field1 = $columns->addChild('FIELD');
                                $field1->addAttribute('id', $vital_date_box);
                                $field1->addAttribute('type', 'label');

                                $properties1 = $field1->addChild('PROPERTIES');

                                $property1 = $properties1->addChild('PROPERTY', $vital_date_box);
                                $property1->addAttribute('name', 'id');

                                $property12 = $properties1->addChild('PROPERTY', $vital_date_box);
                                $property12->addAttribute('name', 'name');

                                $property13 = $properties1->addChild('PROPERTY', 'form-control');
                                $property13->addAttribute('name', 'class');

                                $property14 = $properties1->addChild('PROPERTY', $value['vital_time']);
                                $property14->addAttribute('name', 'value');

                                //Temperature box added
                                $field2 = $columns->addChild('FIELD');
                                $field2->addAttribute('id', $temperature_box);
                                $field2->addAttribute('type', 'label');

                                $properties2 = $field2->addChild('PROPERTIES');

                                $property2 = $properties2->addChild('PROPERTY', $temperature_box);
                                $property2->addAttribute('name', 'id');

                                $property21 = $properties2->addChild('PROPERTY', $temperature_box);
                                $property21->addAttribute('name', 'name');

                                $property22 = $properties2->addChild('PROPERTY', 'form-control');
                                $property22->addAttribute('name', 'class');

                                $property23 = $properties2->addChild('PROPERTY', $value['temperature']);
                                $property23->addAttribute('name', 'value');

                                //Blood Pressure Systolic box added
                                $field3 = $columns->addChild('FIELD');
                                $field3->addAttribute('id', $bp_systolic_box);
                                $field3->addAttribute('type', 'label');

                                $properties3 = $field3->addChild('PROPERTIES');

                                $property3 = $properties3->addChild('PROPERTY', $bp_systolic_box);
                                $property3->addAttribute('name', 'id');

                                $property31 = $properties3->addChild('PROPERTY', $bp_systolic_box);
                                $property31->addAttribute('name', 'name');

                                $property32 = $properties3->addChild('PROPERTY', 'form-control');
                                $property32->addAttribute('name', 'class');

                                $property33 = $properties3->addChild('PROPERTY', $value['blood_pressure_systolic']);
                                $property33->addAttribute('name', 'value');

                                //Blood Pressure Diastolic box added
                                $field4 = $columns->addChild('FIELD');
                                $field4->addAttribute('id', $bp_diastolic_box);
                                $field4->addAttribute('type', 'label');

                                $properties4 = $field4->addChild('PROPERTIES');

                                $property4 = $properties4->addChild('PROPERTY', $bp_diastolic_box);
                                $property4->addAttribute('name', 'id');

                                $property41 = $properties4->addChild('PROPERTY', $bp_diastolic_box);
                                $property41->addAttribute('name', 'name');

                                $property42 = $properties4->addChild('PROPERTY', 'form-control');
                                $property42->addAttribute('name', 'class');

                                $property43 = $properties4->addChild('PROPERTY', $value['blood_pressure_diastolic']);
                                $property43->addAttribute('name', 'value');

                                //Pulse box added
                                $field5 = $columns->addChild('FIELD');
                                $field5->addAttribute('id', $pulse_rate_box);
                                $field5->addAttribute('type', 'label');

                                $properties5 = $field5->addChild('PROPERTIES');

                                $property5 = $properties5->addChild('PROPERTY', $pulse_rate_box);
                                $property5->addAttribute('name', 'id');

                                $property51 = $properties5->addChild('PROPERTY', $pulse_rate_box);
                                $property51->addAttribute('name', 'name');

                                $property52 = $properties5->addChild('PROPERTY', 'form-control');
                                $property52->addAttribute('name', 'class');

                                $property53 = $properties5->addChild('PROPERTY', $value['pulse_rate']);
                                $property53->addAttribute('name', 'value');

                                //Weight box added
                                $field6 = $columns->addChild('FIELD');
                                $field6->addAttribute('id', $weight_box);
                                $field6->addAttribute('type', 'label');

                                $properties6 = $field6->addChild('PROPERTIES');

                                $property6 = $properties6->addChild('PROPERTY', $weight_box);
                                $property6->addAttribute('name', 'id');

                                $property61 = $properties6->addChild('PROPERTY', $weight_box);
                                $property61->addAttribute('name', 'name');

                                $property62 = $properties6->addChild('PROPERTY', 'form-control');
                                $property62->addAttribute('name', 'class');

                                $property63 = $properties6->addChild('PROPERTY', $value['weight']);
                                $property63->addAttribute('name', 'value');

                                //Height box added
                                $field7 = $columns->addChild('FIELD');
                                $field7->addAttribute('id', $height_box);
                                $field7->addAttribute('type', 'label');

                                $properties7 = $field7->addChild('PROPERTIES');

                                $property7 = $properties7->addChild('PROPERTY', $height_box);
                                $property7->addAttribute('name', 'id');

                                $property71 = $properties7->addChild('PROPERTY', $height_box);
                                $property71->addAttribute('name', 'name');

                                $property72 = $properties7->addChild('PROPERTY', 'form-control');
                                $property72->addAttribute('name', 'class');

                                $property73 = $properties7->addChild('PROPERTY', $value['height']);
                                $property73->addAttribute('name', 'value');

                                //sp02 box added
                                $field8 = $columns->addChild('FIELD');
                                $field8->addAttribute('id', $sp02_box);
                                $field8->addAttribute('type', 'label');

                                $properties8 = $field8->addChild('PROPERTIES');

                                $property8 = $properties8->addChild('PROPERTY', $sp02_box);
                                $property8->addAttribute('name', 'id');

                                $property81 = $properties8->addChild('PROPERTY', $sp02_box);
                                $property81->addAttribute('name', 'name');

                                $property82 = $properties8->addChild('PROPERTY', 'form-control');
                                $property82->addAttribute('name', 'class');

                                $property83 = $properties8->addChild('PROPERTY', $value['sp02']);
                                $property83->addAttribute('name', 'value');

                                //Painscore box added
                                $field9 = $columns->addChild('FIELD');
                                $field9->addAttribute('id', $pain_score_box);
                                $field9->addAttribute('type', 'label');

                                $properties9 = $field9->addChild('PROPERTIES');

                                $property9 = $properties9->addChild('PROPERTY', $pain_score_box);
                                $property9->addAttribute('name', 'id');

                                $property91 = $properties9->addChild('PROPERTY', $pain_score_box);
                                $property91->addAttribute('name', 'name');

                                $property92 = $properties9->addChild('PROPERTY', 'form-control');
                                $property92->addAttribute('name', 'class');

                                $property93 = $properties9->addChild('PROPERTY', $value['pain_score']);
                                $property93->addAttribute('name', 'value');

                                //BMI box added
//                                $field10 = $columns->addChild('FIELD');
//                                $field10->addAttribute('id', $bmi_box);
//                                $field10->addAttribute('type', 'label');
//
//                                $properties10 = $field10->addChild('PROPERTIES');
//
//                                $property10 = $properties10->addChild('PROPERTY', $bmi_box);
//                                $property10->addAttribute('name', 'id');
//
//                                $property101 = $properties10->addChild('PROPERTY', $bmi_box);
//                                $property101->addAttribute('name', 'name');
//
//                                $property102 = $properties10->addChild('PROPERTY', 'form-control');
//                                $property102->addAttribute('name', 'class');
//
//                                $property103 = $properties10->addChild('PROPERTY', $value['bmi']);
//                                $property103->addAttribute('name', 'value');
                            }
                        }

                        if ($vitalaction) {
                            $columns = $x->addChild('COLUMNS');

                            $vital_time = date("Y-m-d H:i:s");

                            //Vital date time
                            $field1 = $columns->addChild('FIELD');
                            $field1->addAttribute('id', 'txtvitaltime');
                            $field1->addAttribute('type', 'label');

                            $properties1 = $field1->addChild('PROPERTIES');

                            $property1 = $properties1->addChild('PROPERTY', 'txtvitaltime');
                            $property1->addAttribute('name', 'id');

                            $property12 = $properties1->addChild('PROPERTY', 'txtvitaltime');
                            $property12->addAttribute('name', 'name');

                            $property13 = $properties1->addChild('PROPERTY', 'form-control');
                            $property13->addAttribute('name', 'class');

                            $property14 = $properties1->addChild('PROPERTY', $vital_time);
                            $property14->addAttribute('name', 'value');

                            //Temperature box added
                            $field2 = $columns->addChild('FIELD');
                            $field2->addAttribute('id', 'txttemperature');
                            $field2->addAttribute('type', 'TextBox');

                            $properties2 = $field2->addChild('PROPERTIES');

                            $property2 = $properties2->addChild('PROPERTY', 'txttemperature');
                            $property2->addAttribute('name', 'id');

                            $property21 = $properties2->addChild('PROPERTY', 'txttemperature');
                            $property21->addAttribute('name', 'name');

                            $property22 = $properties2->addChild('PROPERTY', 'form-control');
                            $property22->addAttribute('name', 'class');

                            //Blood Pressure Systolic box added
                            $field3 = $columns->addChild('FIELD');
                            $field3->addAttribute('id', 'txtbp_systolic');
                            $field3->addAttribute('type', 'TextBox');

                            $properties3 = $field3->addChild('PROPERTIES');

                            $property3 = $properties3->addChild('PROPERTY', 'txtbp_systolic');
                            $property3->addAttribute('name', 'id');

                            $property31 = $properties3->addChild('PROPERTY', 'txtbp_systolic');
                            $property31->addAttribute('name', 'name');

                            $property32 = $properties3->addChild('PROPERTY', 'form-control');
                            $property32->addAttribute('name', 'class');

                            //Blood Pressure Diastolic box added
                            $field4 = $columns->addChild('FIELD');
                            $field4->addAttribute('id', 'txtbp_diastolic');
                            $field4->addAttribute('type', 'TextBox');

                            $properties4 = $field4->addChild('PROPERTIES');

                            $property4 = $properties4->addChild('PROPERTY', 'txtbp_diastolic');
                            $property4->addAttribute('name', 'id');

                            $property41 = $properties4->addChild('PROPERTY', 'txtbp_diastolic');
                            $property41->addAttribute('name', 'name');

                            $property42 = $properties4->addChild('PROPERTY', 'form-control');
                            $property42->addAttribute('name', 'class');

                            //Pulse box added
                            $field5 = $columns->addChild('FIELD');
                            $field5->addAttribute('id', 'txtpulse_rate');
                            $field5->addAttribute('type', 'TextBox');

                            $properties5 = $field5->addChild('PROPERTIES');

                            $property5 = $properties5->addChild('PROPERTY', 'txtpulse_rate');
                            $property5->addAttribute('name', 'id');

                            $property51 = $properties5->addChild('PROPERTY', 'txtpulse_rate');
                            $property51->addAttribute('name', 'name');

                            $property52 = $properties5->addChild('PROPERTY', 'form-control');
                            $property52->addAttribute('name', 'class');

                            //Weight box added
                            $field6 = $columns->addChild('FIELD');
                            $field6->addAttribute('id', 'txtweight');
                            $field6->addAttribute('type', 'TextBox');

                            $properties6 = $field6->addChild('PROPERTIES');

                            $property6 = $properties6->addChild('PROPERTY', 'txtweight');
                            $property6->addAttribute('name', 'id');

                            $property61 = $properties6->addChild('PROPERTY', 'txtweight');
                            $property61->addAttribute('name', 'name');

                            $property62 = $properties6->addChild('PROPERTY', 'form-control');
                            $property62->addAttribute('name', 'class');

                            //Height box added
                            $field7 = $columns->addChild('FIELD');
                            $field7->addAttribute('id', 'txtheight');
                            $field7->addAttribute('type', 'TextBox');

                            $properties7 = $field7->addChild('PROPERTIES');

                            $property7 = $properties7->addChild('PROPERTY', 'txtheight');
                            $property7->addAttribute('name', 'id');

                            $property71 = $properties7->addChild('PROPERTY', 'txtheight');
                            $property71->addAttribute('name', 'name');

                            $property72 = $properties7->addChild('PROPERTY', 'form-control');
                            $property72->addAttribute('name', 'class');

                            //sp02 box added
                            $field8 = $columns->addChild('FIELD');
                            $field8->addAttribute('id', 'txtsp02');
                            $field8->addAttribute('type', 'TextBox');

                            $properties8 = $field8->addChild('PROPERTIES');

                            $property8 = $properties8->addChild('PROPERTY', 'txtsp02');
                            $property8->addAttribute('name', 'id');

                            $property81 = $properties8->addChild('PROPERTY', 'txtsp02');
                            $property81->addAttribute('name', 'name');

                            $property82 = $properties8->addChild('PROPERTY', 'form-control');
                            $property82->addAttribute('name', 'class');

                            //Painscore box added
                            $field9 = $columns->addChild('FIELD');
                            $field9->addAttribute('id', 'txtpain_score');
                            $field9->addAttribute('type', 'TextBox');

                            $properties9 = $field9->addChild('PROPERTIES');

                            $property9 = $properties9->addChild('PROPERTY', 'txtpain_score');
                            $property9->addAttribute('name', 'id');

                            $property91 = $properties9->addChild('PROPERTY', 'txtpain_score');
                            $property91->addAttribute('name', 'name');

                            $property92 = $properties9->addChild('PROPERTY', 'form-control');
                            $property92->addAttribute('name', 'class');

                            //BMI box added
//                            $field10 = $columns->addChild('FIELD');
//                            $field10->addAttribute('id', 'txtbmi');
//                            $field10->addAttribute('type', 'label');
//
//                            $properties10 = $field10->addChild('PROPERTIES');
//
//                            $property10 = $properties10->addChild('PROPERTY', 'txtbmi');
//                            $property10->addAttribute('name', 'id');
//
//                            $property101 = $properties10->addChild('PROPERTY', 'txtbmi');
//                            $property101->addAttribute('name', 'name');
//
//                            $property102 = $properties10->addChild('PROPERTY', 'form-control');
//                            $property102->addAttribute('name', 'class');
                        }
                    }
                }
            }
        }
        $xml = $xmlLoad->asXML();
        return $xml;
    }

    protected function prepareIcdCodeXml($xml, $table_id, $rowCount) {
        $xmlLoad = simplexml_load_string($xml);
        foreach ($xmlLoad->children() as $group) {
            foreach ($group->PANELBODY->FIELD as $x) {
                if ($x->attributes()->type == 'RadGrid' && $x->attributes()->AddButtonTableId == $table_id) {

                    $text_box = 'icd_code' . $rowCount;
                    $columns = $x->addChild('COLUMNS');

                    $field1 = $columns->addChild('FIELD');
                    $field1->addAttribute('id', $text_box);
                    $field1->addAttribute('type', 'TextBox');
                    $field1->addAttribute('label', '');

                    $properties1 = $field1->addChild('PROPERTIES');

                    $property1 = $properties1->addChild('PROPERTY', $text_box);
                    $property1->addAttribute('name', 'id');

                    $property2 = $properties1->addChild('PROPERTY', $text_box);
                    $property2->addAttribute('name', 'name');

                    $property3 = $properties1->addChild('PROPERTY', 'form-control icd_code_autocomplete');
                    $property3->addAttribute('name', 'class');
                }
            }
        }
        $xml = $xmlLoad->asXML();
        return $xml;
    }

    protected function prepareXml($xml, $post) {
        $xmlLoad = simplexml_load_string($xml);
        $postKeys = array_keys($post);

        foreach ($xmlLoad->children() as $group) {
            foreach ($group->PANELBODY->FIELD as $x) {

                //Main Field - GRID
                if ($x->attributes()->type == 'RadGrid') {
                    foreach ($x->COLUMNS as $columns) {
                        foreach ($columns->FIELD as $field) {
                            //Child FIELD
                            if (isset($field->FIELD)) {
                                foreach ($field->FIELD as $y) {
                                    foreach ($post as $key => $value) {
                                        if ($key == $y->attributes()->id) {
                                            $type = $y->attributes()->type;

                                            if ($type == 'CheckBoxList') {
                                                $post_referral_details = $value; // Array
                                                $list_referral_details = $y->LISTITEMS->LISTITEM;
                                                foreach ($list_referral_details as $list_value) {
                                                    if (in_array($list_value, $post_referral_details)) {
                                                        $list_value->attributes()['Selected'] = 'true';
                                                    } else {
                                                        $list_value->attributes()['Selected'] = 'false';
                                                    }
                                                }
                                            } elseif ($type == 'DropDownList' || $type == 'RadioButtonList') {
                                                $post_referral_details = $value; // String
                                                $list_referral_details = $y->LISTITEMS->LISTITEM;
                                                foreach ($list_referral_details as $list_value) {
                                                    if ($list_value == $post_referral_details) {
                                                        $list_value->attributes()['Selected'] = 'true';
                                                    } else {
                                                        $list_value->attributes()['Selected'] = 'false';
                                                    }
                                                }
                                            } elseif ($type == 'textareaFull' || $type == 'TextArea') {
                                                if (isset($y->VALUE)) {
                                                    unset($y->VALUE);
                                                }
                                                $y->addChild('VALUE');
                                                if ($value != '')
                                                    $this->addCData($value, $y->VALUE);
                                            } else {
                                                foreach ($y->PROPERTIES->PROPERTY as $text_pro) {
                                                    if ($text_pro['name'] == 'value') {
                                                        $dom = dom_import_simplexml($text_pro);
                                                        $dom->parentNode->removeChild($dom);
                                                    }
                                                }
                                                $text_box_value = $y->PROPERTIES->addChild('PROPERTY', $value);
                                                $text_box_value->addAttribute('name', 'value');
                                            }
                                        }
                                    }
                                }
                            }

                            //Main FIELD
                            foreach ($post as $key => $value) {
                                if ($key == $field->attributes()->id) {
                                    $type = $field->attributes()->type;
                                    //Checkbox
                                    if ($type == 'CheckBoxList') {
                                        $post_referral_details = $value;
                                        $list_referral_details = $field->LISTITEMS->LISTITEM;
                                        foreach ($list_referral_details as $list_value) {
                                            if (in_array($list_value, $post_referral_details)) {
                                                $list_value->attributes()['Selected'] = 'true';
                                            } else {
                                                $list_value->attributes()['Selected'] = 'false';
                                            }
                                        }
                                    } elseif ($type == 'DropDownList' || $type == 'RadioButtonList') {
                                        $field->attributes()['Backcontrols'] = 'hide';
//                                        $radio_field_id = ['radio_med_his_currently_under_treatment'];
                                        $list_values_array = ['No'];

                                        $post_referral_details = $value;
                                        $list_referral_details = $field->LISTITEMS->LISTITEM;
                                        foreach ($list_referral_details as $list_value) {
                                            if ($list_value == $post_referral_details) {
//                                                if (in_array($key, $radio_field_id)) {
                                                if (in_array($list_value, $list_values_array)) {
                                                    $field->attributes()['Backcontrols'] = 'show';
                                                }
//                                                }
                                                $list_value->attributes()['Selected'] = 'true';
                                            } else {
                                                $list_value->attributes()['Selected'] = 'false';
                                            }
                                        }
                                    } elseif ($type == 'textareaFull' || $type == 'TextArea') {
                                        if (isset($field->VALUE)) {
                                            unset($field->VALUE);
                                        }
                                        $field->addChild('VALUE');
                                        if ($value != '')
                                            $this->addCData($value, $field->VALUE);
                                    } else {
                                        foreach ($field->PROPERTIES->PROPERTY as $text_pro) {
                                            if ($text_pro['name'] == 'value') {
                                                $dom = dom_import_simplexml($text_pro);
                                                $dom->parentNode->removeChild($dom);
                                            }
                                        }
                                        $text_box_value = $field->PROPERTIES->addChild('PROPERTY', $value);
                                        $text_box_value->addAttribute('name', 'value');
                                    }
                                }
                            }
                        }
                    }
                }

                //Main FIELD - Normal Checkbox, Radio, Input, etc...
                foreach ($post as $key => $value) {
                    if ($key == $x->attributes()->id) {
                        $type = $x->attributes()->type;
                        //Checkbox
                        if ($type == 'CheckBoxList' || $type == 'MultiDropDownList') {
                            $post_referral_details = $value;
                            $list_referral_details = $x->LISTITEMS->LISTITEM;
                            $x->attributes()['Backcontrols'] = 'hide';
                            foreach ($list_referral_details as $list_value) {
                                if (in_array($list_value, $post_referral_details)) {
                                    $list_value->attributes()['Selected'] = 'true';
                                    if ($list_value == 'Diabetes' || $list_value == 'Hypertension' || $list_value == 'CVA' || $list_value == 'Asthma/Allergy/TB' || $list_value == 'Cancer' || $list_value == 'Seizure' || $list_value == 'CAD' || $list_value == 'Mental Illness' || $list_value == 'Others') {
                                        $x->attributes()['Backcontrols'] = 'show';
                                    }
                                } else {
                                    $list_value->attributes()['Selected'] = 'false';
                                }
                            }
                        } elseif ($type == 'DropDownList' || $type == 'RadioButtonList') {
                            $x->attributes()['Backcontrols'] = 'hide';
                            $radio_field_id = ['religion', 'relationship', 'social_functioning', 'occupational_functioning', 'similar_episodes'];
                            $list_values_array = ['Others', 'Impaired', 'Yes'];

                            $post_referral_details = $value;
                            $list_referral_details = $x->LISTITEMS->LISTITEM;

                            foreach ($list_referral_details as $list_value) {
                                if ($list_value == $post_referral_details) {
                                    if (in_array($key, $radio_field_id)) {
                                        if (in_array($list_value, $list_values_array)) {
                                            $x->attributes()['Backcontrols'] = 'show';
                                        }
                                    } else {
                                        $x->attributes()['Backcontrols'] = 'show';
                                    }
                                    $list_value->attributes()['Selected'] = 'true';
                                } else {
                                    $list_value->attributes()['Selected'] = 'false';
                                }
                            }
                        } elseif ($type == 'textareaFull' || $type == 'TextArea') {
                            if (isset($x->VALUE)) {
                                unset($x->VALUE);
                            }
                            $x->addChild('VALUE');
                            if ($value != '')
                                $this->addCData($value, $x->VALUE);
                        } else {
                            if (isset($x->PROPERTIES->PROPERTY)) {
                                foreach ($x->PROPERTIES->PROPERTY as $text_pro) {
                                    if ($text_pro['name'] == 'value') {
                                        $dom = dom_import_simplexml($text_pro);
                                        $dom->parentNode->removeChild($dom);
                                    }
                                }
                            }

                            $text_box_value = $x->PROPERTIES->addChild('PROPERTY', $value);
                            $text_box_value->addAttribute('name', 'value');
                        }
                    }
                }

                //Child FIELD
                if (isset($x->FIELD)) {
                    foreach ($x->FIELD as $y) {
                        foreach ($post as $key => $value) {
                            if ($key == $y->attributes()->id) {
                                $type = $y->attributes()->type;

                                if ($type == 'CheckBoxList') {
                                    $post_referral_details = $value; // Array
                                    $list_referral_details = $y->LISTITEMS->LISTITEM;
                                    foreach ($list_referral_details as $list_value) {
                                        if (in_array($list_value, $post_referral_details)) {
                                            $list_value->attributes()['Selected'] = 'true';
                                        } else {
                                            $list_value->attributes()['Selected'] = 'false';
                                        }
                                    }
                                } elseif ($type == 'DropDownList' || $type == 'RadioButtonList') {
                                    $post_referral_details = $value;
                                    $list_referral_details = $y->LISTITEMS->LISTITEM;
                                    foreach ($list_referral_details as $list_value) {
                                        if ($list_value == $post_referral_details) {
                                            $list_value->attributes()['Selected'] = 'true';
                                        } else {
                                            $list_value->attributes()['Selected'] = 'false';
                                        }
                                    }
                                } elseif ($type == 'textareaFull' || $type == 'TextArea') {
                                    if (isset($y->VALUE)) {
                                        unset($y->VALUE);
                                    }
                                    $y->addChild('VALUE');
                                    if ($value != '')
                                        $this->addCData($value, $y->VALUE);
                                } else {
                                    foreach ($y->PROPERTIES->PROPERTY as $text_pro) {
                                        if ($text_pro['name'] == 'value') {
                                            $dom = dom_import_simplexml($text_pro);
                                            $dom->parentNode->removeChild($dom);
                                        }
                                    }
                                    $text_box_value = $y->PROPERTIES->addChild('PROPERTY', $value);
                                    $text_box_value->addAttribute('name', 'value');
                                }
                            }
                        }
                    }
                }
            }
        }

        $xml = $xmlLoad->asXML();
        return $xml;
    }

    protected function addCData($cdata_text, \SimpleXMLElement $node) {
        $node = dom_import_simplexml($node);
        $no = $node->ownerDocument;
        $node->appendChild($no->createCDATASection($cdata_text));
    }

    public function actionGetpatientdocuments() {
        $get = Yii::$app->getRequest()->get();
        //print_r($get); die;
        if (isset($get['patient_id'])) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);
            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $condition = [
                'deleted_at' => '0000-00-00 00:00:00',
                'doc_type' => 'MCH'
            ];

            $data = VDocuments::find()
                    ->where($condition)
                    ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                    ->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->asArray()
                    ->all();

            foreach ($data as $key => $value) {
                $details = VDocuments::find()
                        ->where(['encounter_id' => $value['encounter_id'],
                                //'tenant_id' => $value['tenant_id']
                        ])
                        ->andWhere($condition)
                        ->orderBy(['date_time' => SORT_DESC])
                        ->asArray()
                        ->all();

                $data[$key]['all'] = $details;
            }
            return ['success' => true, 'result' => $data];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetpastmedicalhistory() {
        $get = Yii::$app->getRequest()->get();
        if (isset($get['patient_id'])) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);
            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();
            $details = PatPastMedical::find()
                    ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                    ->orderBy(['pat_past_medical_id' => SORT_DESC])
                    ->all();
            return ['success' => true, 'result' => $details];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionUpdatepastmedical() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $model = PatPastMedical::find()
                    ->joinWith(['patDocuments'])
                    ->where(['pat_past_medical_id' => $post['pat_past_medical_id']])
                    ->one();
            $model->past_medical = $post['past_medical'];
            $model->save(FALSE);
            $this->replaceTextareavalue($post['past_medical'], $model->patDocuments->xml_path);
            return ['success' => true];
        } else {
            return ['success' => false];
        }
    }

    protected function replaceTextareavalue($textareaValue, $file) {
        $xpath = "/FIELDS/GROUP/PANELBODY//FIELD[@id='past_medical_notes']";
        $xml = simplexml_load_file($file, null, LIBXML_NOERROR);
        $targets = $xml->xpath($xpath);
        if (!empty($targets)) {
            foreach ($targets as $key => $value) {
                unset($value->VALUE);
                $value->addChild('VALUE');
                $this->addCData($textareaValue, $value->VALUE);
            }
        }
        $xml->asXML($file);
    }

    public function actionGetmchdocument() {
        $get = Yii::$app->getRequest()->get();
        if (isset($get['patient_id'])) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);
            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();
            $details = PatDocuments::find()
                    ->joinWith(['docType'])
                    ->andWhere("patient_id IN ($all_patient_id->allpatient)")
                    ->andWhere(["pat_document_types.doc_type" => "MCH"])
                    ->orderBy(['doc_id' => SORT_DESC])
                    ->all();
            return ['success' => true, 'result' => $details];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

}
