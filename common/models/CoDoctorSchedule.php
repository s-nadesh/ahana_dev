<?php

namespace common\models;

use common\models\query\CoDoctorScheduleQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_doctor_schedule".
 *
 * @property integer $schedule_id
 * @property integer $tenant_id
 * @property integer $user_id
 * @property string $schedule_day
 * @property string $schedule_time_in
 * @property string $schedule_time_out
 * @property string $created_at
 * @property integer $created_by
 * @property string $modified_at
 * @property integer $modified_by
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 * @property CoUser $user
 */
class CoDoctorSchedule extends RActiveRecord {

    public $timings;
    public $custom_day;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_doctor_schedule';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'user_id'], 'required'],
                [['custom_day', 'timings'], 'required', 'on' => 'create'],
                [['tenant_id', 'user_id', 'created_by', 'modified_by'], 'integer'],
                [['schedule_day'], 'string'],
                [['schedule_time_in', 'schedule_time_out', 'created_at', 'modified_at', 'deleted_at', 'custom_day', 'timings'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'schedule_id' => 'Schedule ID',
            'tenant_id' => 'Tenant',
            'user_id' => 'Doctor',
            'schedule_day' => 'Schedule Day',
            'schedule_time_in' => 'Schedule Time In',
            'schedule_time_out' => 'Schedule Time Out',
            'created_at' => 'Created At',
            'created_by' => 'Created By',
            'modified_at' => 'Modified At',
            'modified_by' => 'Modified By',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }

    public static function find() {
        return new CoDoctorScheduleQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'doctor_name' => function ($model) {
                return (isset($model->user) ? $model->user->title_code . $model->user->name : '-');
            },
            'interval' => function ($model) {
                return (isset($model->user->interval) ? $model->user->interval->interval : 5);
            },
            'available_day' => function ($model) {
                if (isset($model->schedule_day)) {
                    return ($model->schedule_day != '-1') ? date('l', mktime(0, 0, 0, 8, $model->schedule_day, 2011)) : 'All Day';
                } else {
                    return '-';
                }
            },
            'time_in' => function ($model) {
                return (isset($model->schedule_time_in) ? date('h:i a', strtotime($model->schedule_time_in)) : '-');
            },
            'time_out' => function ($model) {
                return (isset($model->schedule_time_out) ? date('h:i a', strtotime($model->schedule_time_out)) : '-');
            },
            'available_time' => function ($model) {
                return (isset($model->schedule_time_in) ? "{$model->schedule_time_in}-{$model->schedule_time_out}" : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function beforeSave($insert) {
        $this->schedule_time_in = date('H:i:s', strtotime($this->schedule_time_in));
        $this->schedule_time_out = date('H:i:s', strtotime($this->schedule_time_out));

        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        $user = CoUser::find()->where(['user_id' => $this->user_id])->one();
        if ($insert)
            $activity = "Doctor Schedule Added Successfully (#$user->name)";
        else
            $activity = "Doctor Schedule updated Successfully (#$user->name)";
        CoAuditLog::insertAuditLog(CoDoctorSchedule::tableName(), $this->schedule_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
