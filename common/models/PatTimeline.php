<?php

namespace common\models;

use common\models\query\PatTimelineQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_timeline".
 *
 * @property integer $timeline_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property string $date_time
 * @property string $header
 * @property string $header_sub
 * @property string $message
 * @property string $ip_adderss
 * @property string $status
 * @property string $resource
 * @property integer $encounter_id
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatTimeline extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_timeline';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'patient_id', 'date_time', 'header', 'message'], 'required'],
            [['tenant_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
            [['date_time', 'created_at', 'modified_at', 'deleted_at', 'resource', 'encounter_id'], 'safe'],
            [['status'], 'string'],
            [['header', 'header_sub'], 'string', 'max' => 100],
            [['message'], 'string', 'max' => 255],
            [['ip_adderss'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'timeline_id' => 'Timeline ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'date_time' => 'Date Time',
            'header' => 'Header',
            'header_sub' => 'Header Sub',
            'message' => 'Message',
            'ip_adderss' => 'Ip Adderss',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function insertTimeLine($patient_id, $date_time, $header, $header_sub, $message, $resource, $encounter_id = null) {
        $model = new PatTimeline;
        $model->attributes = [
            'patient_id' => $patient_id,
            'date_time' => $date_time,
            'header' => $header,
            'header_sub' => $header_sub,
            'message' => $message,
            'resource' => $resource,
            'encounter_id' => is_null($encounter_id) ? 0 : $encounter_id,
            'ip_adderss' => Yii::$app->getRequest()->getUserIP()
        ];
        $model->save(false);
    }

    public static function find() {
        return new PatTimelineQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'tenant_name' => function ($model) {
                return isset($model->tenant) ? $model->tenant->tenant_name : '-';
            },
            'created_user' => function ($model) {
                return isset($model->createdUser->name) ? $model->createdUser->name : '-';
            },
            'modified_user' => function ($model) {
                return isset($model->modifiedUser->name) ? $model->modifiedUser->name : '-';
            },
            'clinical_info' => function ($model) {
                return ($model->resource != 'BILLING');
            },
            'adminstrative_info' => function ($model) {
                return ($model->resource == 'BILLING');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
