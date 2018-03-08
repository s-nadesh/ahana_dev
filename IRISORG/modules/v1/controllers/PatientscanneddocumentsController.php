<?php

namespace IRISORG\modules\v1\controllers;

use common\components\HelperComponent;
use common\models\PatPatient;
use common\models\PatScannedDocuments;
use common\models\CoAuditLog;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientscanneddocumentsController extends ActiveController {

    public $modelClass = 'common\models\PatScannedDocuments';

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

    //Delete Function
    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('doc_id');
        if ($id) {
            $model = PatScannedDocuments::find()->where(['scanned_doc_id' => $id])->one();
            $model->remove();
            $activity = 'Scanned document Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatScannedDocuments::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionGetscanneddocument() {
        $get = Yii::$app->getRequest()->get();
        if ($get) {
            $scanned_document = PatScannedDocuments::find()
                    ->tenant()
                    ->status()
                    ->active()
                    ->andWhere(['scanned_doc_name' => $get['doc_name'],
                        'encounter_id' => $get['encounter_id'],
                        'scanned_doc_creation_date' => $get['date_time']
                    ])
                    //->groupBy('encounter_id','scanned_doc_name','patient_id')
                    ->all();
            if (!empty($scanned_document)) {
                $all_file = [];
                foreach ($scanned_document as $key => $value) {
                    $file = file_get_contents(\Yii::$app->basePath . '/web/uploads/' . $value->file_name);
                    $file_url = \yii\helpers\Url::to("@web/uploads/" . $value->file_name . "", true);
                    $result[$key] = ['data' => $value, 'file' => base64_encode($file), 'file_url' => $file_url];
                }
                //$file = file_get_contents(\Yii::$app->basePath . '/web/uploads/' . $scanned_document->file_name);
                //return ['success' => true, 'result' => $scanned_document, 'file' => base64_encode($file)];
                return ['success' => true, 'result' => $result];
            } else {
                return ['success' => false, 'message' => "Result Not Found."];
            }
        }
    }

    //Index Function
    public function actionGetscanneddocuments() {
        $get = Yii::$app->getRequest()->get();

        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);
            $result = [];
            $data = PatScannedDocuments::find()
                    ->tenant()
                    ->status()
                    ->active()
                    ->andWhere(['patient_id' => $patient->patient_id])
                    ->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->all();

            foreach ($data as $key => $value) {
                $details = PatScannedDocuments::find()
                        ->tenant()
                        ->status()
                        ->active()
                        ->andWhere(['patient_id' => $patient->patient_id, 'encounter_id' => $value->encounter_id])
                        ->orderBy(['scanned_doc_id' => SORT_DESC])
                        ->all();
                $result[$key] = ['data' => $value, 'all' => $details];
            }
            return ['success' => true, 'result' => $result];
        }
    }

    //Save Create / Update
    public function actionSavedocument() {
        $post = Yii::$app->getRequest()->post();
        $post['scanned_doc_creation_date'] = $post['year'] . '-' . $post['month'] . '-' . $post['day'] . date('H:i:s');

        $patient = PatPatient::getPatientByGuid($post['patient_id']);
        $patient_id = $patient->patient_id;
        $encounter_id = $post['encounter_id'];

        if (!empty($_FILES)) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $random_string = HelperComponent::getRandomNumber();
            $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
            $filename = $tenant_id . "_" . time() . "_" . $random_string . '.' . $ext;

            $patient_scndocument = new PatScannedDocuments;
            $attr = [
                'patient_id' => $patient->patient_id,
                'encounter_id' => $post['encounter_id'],
                'scanned_doc_name' => $post['scanned_doc_name'],
                'scanned_doc_creation_date' => date('Y-m-d H:i:s', strtotime($post['scanned_doc_creation_date'])),
                'file_org_name' => $_FILES['file']['name'],
                'file_name' => $filename,
                'file_type' => $_FILES['file']['type'],
                'status' => '1',
            ];
            $attr = array_merge($post, $attr);
            $patient_scndocument->attributes = $attr;

            if ($patient_scndocument->validate()) {
                if (!file_exists(\Yii::$app->basePath . '/web/uploads')) {
                    mkdir(\Yii::$app->basePath . '/web/uploads', 0777, true);
                }
                $uploadPath = \Yii::$app->basePath . '/web/uploads/' . $filename;
                move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath);
                $patient_scndocument->save(false);
                return ['success' => true, 'message' => "Upload success!!!"];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$patient_scndocument])];
            }
        } else {
            return ['success' => false, 'message' => "Please upload Files."];
        }
    }

}
