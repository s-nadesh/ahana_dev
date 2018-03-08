<?php

namespace common\models;

use common\models\query\CoDoctorIntervalQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_doctor_interval".
 *
 * @property integer $interval_id
 * @property integer $tenant_id
 * @property integer $user_id
 * @property integer $interval
 * @property string $created_at
 * @property integer $created_by
 * @property string $modified_at
 * @property integer $modified_by
 * @property string $deleted_at
 */
class CoDoctorInterval extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_doctor_interval';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['interval'], 'required'],
                [['tenant_id', 'user_id', 'interval', 'created_by', 'modified_by'], 'integer'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
                [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoUser::className(), 'targetAttribute' => ['user_id' => 'user_id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'interval_id' => 'Interval ID',
            'tenant_id' => 'Tenant ID',
            'user_id' => 'User ID',
            'interval' => 'Interval',
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
        return new CoDoctorIntervalQuery(get_called_class());
    }
    
    public function afterSave($insert, $changedAttributes) {
        $user = CoUser::find()->where(['user_id' => $this->user_id])->one();
        if ($insert)
            $activity = "Doctor Interval Added Successfully (#$user->name)";
        else
            $activity = "Doctor Interval updated Successfully (#$user->name)";
        CoAuditLog::insertAuditLog(CoDoctorInterval::tableName(), $this->interval_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
}
